// src/controllers/payment.controller.ts - Fixed version
import { Request, Response } from "express"; 
import User, { IUser } from "../models/user.model"; 
import Organization from "../models/organization.model"; // Added import
import AuditLog from "../models/audit-log.model"; // Added import
import Stripe from "stripe"; 
import { sendPremiumConfirmationEmail } from "../services/email.service";  

// Use the exact API version that TypeScript expects
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {     
  apiVersion: "2025-03-31.basil" 
});  

export const createCheckoutSession = async (req: Request, res: Response) => {     
  // Type the user correctly
  const user = req.user as IUser & { _id: { toString(): string } };
  
  try {         
    const session = await stripe.checkout.sessions.create({             
      payment_method_types: ["card"],             
      line_items: [                 
        {                     
          price_data: {                         
            currency: "usd",                         
            product_data: {                             
              name: "Lifetime Subscription",                         
            },                         
            unit_amount: 1000,                     
          },                     
          quantity: 1,                 
        },             
      ],             
      customer_email: user.email,             
      mode: "payment",             
      success_url: `${process.env.CLIENT_URL}/payment-success`,             
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,             
      client_reference_id: user._id.toString(),         
    });                  
    
    res.json({ sessionId: session.id });     
  } catch (error) {      
    console.error(error);      
    res.status(500).json({ error: "Failed to create charge" });     
  } 
};  

export const handleWebHook = async (req: Request, res: Response) => {     
  const sig = req.headers["stripe-signature"] as string;      
  let event: Stripe.Event;       
  
  try {         
    event = stripe.webhooks.constructEvent(             
      req.body,             
      sig,             
      process.env.STRIPE_WEBHOOK_SECRET!         
    );      
  } catch (err: any) {         
    console.error("Webhook signature verification failed:", err.message);         
    res.status(400).send(`Webhook Error: ${err.message}`);         
    return;       
  }       
  
  // Handle individual premium subscription
  if (event.type === "checkout.session.completed") {         
    const session = event.data.object as Stripe.Checkout.Session;         
    const userId = session.client_reference_id;          
    
    if (userId) {             
      try {
        const user = await User.findByIdAndUpdate(
          userId,                 
          { isPremium: true },                 
          { new: true }             
        );              
        
        if (user && user.email) {
          // Use displayName directly - it's guaranteed to exist based on your model
          await sendPremiumConfirmationEmail(user.email, user.displayName);
          console.log(`Premium confirmation email sent to ${user.email}`);
        } else {
          console.error("User or email not found:", user);
        }
      } catch (error) {
        console.error("Error updating user premium status:", error);
      }
    }      
  }

  // Handle enterprise subscription
  if (event.type === "checkout.session.completed" || event.type === "customer.subscription.created") {
    const session = event.data.object;
    
    // Check if this is an enterprise subscription by looking for organizationId in metadata
    const organizationId = session.metadata?.organizationId;
    
    if (organizationId) {
      try {
        const planType = session.metadata?.planType;
        const maxUsers = parseInt(session.metadata?.maxUsers || "10", 10);
        const features = getFeaturesByPlan(planType);
        
        // Fix the subscription property error by checking the object type
        let subscriptionId: string | undefined;
        
        if ('subscription' in session && session.subscription) {
          // For Checkout.Session objects, the subscription is a string
          subscriptionId = session.subscription as string;
        } else if ('id' in session) {
          // For Subscription objects, use its ID
          subscriptionId = session.id;
        }
        
        // Update organization subscription details
        if (subscriptionId) {
          await Organization.findByIdAndUpdate(
            organizationId,
            { 
              planType,
              maxUsers,
              features,
              stripeSubscriptionId: subscriptionId,
              "teamSettings.customTemplates": planType !== "basic"
            }
          );
          
          console.log(`Enterprise subscription activated for organization ${organizationId}`);
          
          // Create an audit log entry
          const organization = await Organization.findById(organizationId);
          if (organization) {
            const admin = await User.findOne({ 
              organizationId, 
              role: "admin" 
            });
            
            if (admin) {
              await AuditLog.create({
                organizationId,
                userId: admin._id,
                action: "subscription_activated",
                resourceType: "organization",
                resourceId: organizationId,
                details: `${planType} subscription activated`
              });
            }
          }
        } else {
          console.error("Could not find subscription ID in webhook data");
        }
      } catch (error) {
        console.error("Error processing enterprise subscription:", error);
      }
    }
  }
       
  res.json({ received: true }); 
};  

export const getPremiumStatus = async (req: Request, res: Response) => {     
  const user = req.user as IUser;     
  
  if (user.isPremium) {         
    res.json({ status: "active" });     
  } else {         
    res.json({ status: "inactive" });     
  } 
};

// Helper function to get features by plan
function getFeaturesByPlan(planType?: string): string[] {
  const baseFeatures = [
    "team-collaboration", 
    "contract-sharing", 
    "analytics-dashboard"
  ];
  
  switch (planType) {
    case "professional":
      return [
        ...baseFeatures,
        "advanced-analytics",
        "custom-templates",
        "bulk-upload"
      ];
    case "enterprise":
      return [
        ...baseFeatures,
        "advanced-analytics",
        "custom-templates",
        "bulk-upload",
        "sso-integration",
        "audit-logs",
        "api-access",
        "dedicated-support"
      ];
    default: // basic
      return baseFeatures;
  }
}
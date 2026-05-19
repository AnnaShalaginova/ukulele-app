import React, { useState } from "react";
import { supabase } from "./supabase";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", msg: "" });

    try {
      // We will call a Supabase Edge Function named 'send-contact-email'
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: { name, email, message },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error.message || "Failed to send email via Resend");

      setStatus({ type: "success", msg: "Message sent successfully! 🚀" });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setStatus({ 
        type: "error", 
        msg: "Failed to send message. Please try again later." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-container" style={{ marginTop: '40px', padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Contact Me</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Have a suggestion or found a bug? Send a message anonymously.
      </p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Your Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
        <input 
          type="email" 
          placeholder="Your Email (so I can reply)" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
        <textarea 
          placeholder="Your Message..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          required 
          rows="5"
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}
        />
        
        <button 
          type="submit" 
          className="primary-btn" 
          disabled={isSubmitting}
          style={{ padding: '12px', fontWeight: 'bold' }}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
        
        {status.msg && (
          <div style={{ 
            padding: '10px', 
            borderRadius: '8px', 
            textAlign: 'center',
            backgroundColor: status.type === "success" ? "#d4edda" : "#f8d7da",
            color: status.type === "success" ? "#155724" : "#721c24",
            marginTop: '10px'
          }}>
            {status.msg}
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactForm;

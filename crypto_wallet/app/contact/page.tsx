'use client'
import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import { notify } from "@/utils/notifications";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faMapMarkerAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const ContactForm = () => {
  const [state, handleSubmit] = useForm("mrbzjwqj");

  if (state.succeeded) {
    notify({ type: "success", message: "Your message has been sent!" });
    return <p className="text-green-500">Thanks for joining!</p>;
  }

  return (
    <div className="bg-slate-950 min-h-screen flex flex-col justify-center items-center p-6">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white">LET'S CHAT!</h1>
        <p className="text-slate-400 mt-2">We would love to learn about your project.</p>
      </div>

      {/* Contact Details Section */}
      <div className="flex justify-center space-x-12 mb-12">
        <div className="text-center">
          <FontAwesomeIcon icon={faPhone} className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-slate-300 mt-2">Call us at</p>
          <p className="text-white font-semibold">+91 98732 91449</p>
        </div>
        <div className="text-center">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-slate-300 mt-2">Delhi</p>
          <p className="text-white font-semibold">India</p>
        </div>
        <div className="text-center">
          <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6 text-slate-400 mx-auto" />
          <p className="text-slate-300 mt-2">Email us at</p>
          <p className="text-white font-semibold">sambhavjain874@gmail.com</p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="w-full max-w-lg bg-slate-800 px-8 py-12 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-slate-300 mb-2">Email Address</label>
            <Input
              id="email"
              type="email"
              name="email"
              className="bg-slate-700 text-white border-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <ValidationError
              prefix="Email"
              field="email"
              errors={state.errors}
              className="text-red-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="block text-slate-300 mb-2">Message</label>
            <Textarea
              id="message"
              name="message"
              className="bg-slate-700 text-white border-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <ValidationError
              prefix="Message"
              field="message"
              errors={state.errors}
              className="text-red-500"
            />
          </div>

          <Button
            type="submit"
            disabled={state.submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
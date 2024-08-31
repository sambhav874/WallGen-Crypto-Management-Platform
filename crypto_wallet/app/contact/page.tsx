'use client'
import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import { notify } from "@/utils/notifications";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ContactForm = () => {
  const [state, handleSubmit] = useForm("mrbzjwqj");

  if (state.succeeded) {
    notify({ type: "success", message: "Your message has been sent!" });
    return <p className="text-green-500">Thanks for joining!</p>;
  }

  return (
    <div className="bg-gray-900 min-h-screen flex justify-center items-center p-6">
      <div className="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-white mb-2">Email Address</label>
            <Input
              id="email"
              type="email"
              name="email"
              className="bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <ValidationError
              prefix="Email"
              field="email"
              errors={state.errors}
              className="text-red-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="block text-white mb-2">Message</label>
            <Textarea
              id="message"
              name="message"
              className="bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
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
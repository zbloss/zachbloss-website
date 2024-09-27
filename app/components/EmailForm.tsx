"use client";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useRouter } from "next/navigation";

interface EmailFormProps {
  buttonText: string;
}

export default function EmailForm({ buttonText }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!optIn) {
      setMessage("Please agree to the data privacy statement.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");

    try {
    //   await subscribeToBrevo({
    //     email,
    //   });

      router.push("/email-confirmation");
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          // placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-gray-700 bg-white text-blue-900 placeholder-gray-700"
          // required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="opt-in"
          checked={optIn}
          onCheckedChange={(checked) => setOptIn(checked as boolean)}
        />
        <label
          htmlFor="opt-in"
          className="text-sm text-gray-700 cursor-pointer"
        >
          I agree to receive newsletters and accept the data privacy statement.
        </label>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !optIn || !email}
        className="w-full bg-blue-700 text-white hover:bg-blue-800 transition-colors font-bold hand-drawn disabled:opacity-50 disabled:cursor-not-allowed"
        // onClick={() => sendGTMEvent({ event: "emailSubmit" })}
      >
        {isSubmitting ? "Submitting..." : buttonText}
      </Button>
      {message && (
        <p
          className={`text-sm ${
            message.includes("error") ? "text-red-500" : "text-green-500"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';

export default function RazorpayForm({src,id}) {

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const Script = document.createElement("script");
    const Form = document.getElementById("paymentForm");
    Script.setAttribute(
      "src",
      src
    );
    Script.setAttribute("data-subscription_button_id", id);
    Script.setAttribute("data-button_theme", "brand-color");
    Script.setAttribute("async", "true");
    if (Form) {
      Form.appendChild(Script);
    }
  }, [mounted]);


return mounted ? <form id="paymentForm"></form> : null
}

import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { getSession } from "next-auth/react";


//internal import

import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";

const useLoginSubmit = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const redirectUrl = useSearchParams().get("redirectUrl");

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // console.log("router", router.pathname === "/auth/signup");

  const submitHandler = async (data) => {
    const { name, email, password, phone, location } = data;


    setLoading(true);

    // console.log("submitHandler", phone);

    try {
      if (router.pathname === "/auth/signup") {
        // Custom sign-up method
        // console.log("Need to use custom sign-up method");

        // Call the sign-up API which also handles sending the email verification
        //Llama a la API de registro que también gestiona el envío de la verificación por correo electrónico.
        const res = await CustomerServices.verifyEmailAddress({
          name,
          email,
          password,
          
        });

        // console.log("res", res);
        notifySuccess(res.message);
        
        return setLoading(false);
      } else if (router.pathname === "/auth/forget-password") {
        // Call the forget password API for reset password
        const res = await CustomerServices.forgetPassword({
          email,
        });

        // console.log("res", res);
        notifySuccess(res.message);
        return setLoading(false);
      } else if (router.pathname === "/auth/phone-signup") {
        const res = await CustomerServices.verifyPhoneNumber({
          phone,
        });
        notifySuccess(res.message);
        // console.log("sing up with phone", phone, "result", res);
        return setLoading(false);
      }else if (router.pathname === "/auth/signup-location") {
        const session = await getSession();
        const email = session?.user?.email;
            
        if (!email) {
          throw new Error("No email found in session");
        }
      
        const { location } = data;
      
        const res = await CustomerServices.updateLocation({ email, location });
        notifySuccess("Location registered!");
        router.push("/user/dashboard");
        return setLoading(false);
      } else {
        // Login logic (no changes)
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl: "/user/dashboard",
        });

        // console.log("result", result);

        if (result?.error) {
          notifyError(result?.error);
          console.error("Error during sign-in:", result.error);
          setLoading(false);
        } else if (result?.ok) {
          const url = redirectUrl ? "/checkout" : result.url;


            const res = await fetch(`http://localhost:5055/api/customer/email/${email}`)

            const user = await res.json();

            if (!user.location) {
              router.push("/auth/signup-location");
            } else {
              router.push("/user/dashboard");
            }
          setLoading(false);
        }
      }
    } catch (error) {
      // Catch any unexpected errors here (e.g., network issues, unexpected API failures)
      // Detecte aquí cualquier error inesperado (por ejemplo, problemas de red, fallos inesperados de API)
      console.error(
        "Error in submitHandler:",
        error?.response?.data?.message || error?.message
      );
      setLoading(false);
      notifyError(error?.response?.data?.message || error?.message);
    }

  };

  return {
    register,
    errors,
    loading,
    control,
    handleSubmit,
    submitHandler,
  };
};

export default useLoginSubmit;

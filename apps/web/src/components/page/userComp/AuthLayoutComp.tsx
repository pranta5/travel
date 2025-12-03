// components/AuthLayout.tsx
import Image from "next/image";
import Link from "next/link";
import React from "react";

type AuthLayoutProps = {
  /** Pass the Form component (not an element). We'll render it as <Form /> */
  FormComponent: React.ComponentType<any>;
  AboutForm: string;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({
  FormComponent,
  AboutForm,
}) => {
  return (
    <div className={`min-h-screen flex `}>
      {/* Left image panel */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: `url('/img/user_bg.jpg')` /* replace path if needed */,
        }}
      >
        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div> */}

        <div className="p-50 z-10 justify-between w-full">
          <div className="flex flex-col items-center gap-2 text-white">
            <div className=" flex items-center gap-2 justify-center">
              {/* Logo placeholder */}
              <Image
                src="/img/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <h1 className="text-2xl font-serif">HikeSike</h1>
            </div>
            <h2 className="text-2xl mask-radial-from-neutral-950 italic">
              Explore Before You Expire
            </h2>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-white flex items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-8xl font-bold text-sky-600 mb-4">Welcome</h1>
            <p className="text-xl text-gray-500 mb-6">{AboutForm}</p>
          </div>

          {/* Render the passed Form component */}
          <div className="bg-white">
            <FormComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

"use client";
import React, { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
} from "@material-tailwind/react";
import acceptCred from "../../public/accept-cred.json";
import Lottie from "lottie-react";
import axios from "axios";
function AcceptCredential({ setActiveStep, connectionId }) {
  const [issued, setIssued] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    occupation: '',
    citizenship: ''
  });
  const requestSentRef = useRef(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const issueCredential = async () => {
    if (requestSentRef.current) return; // Prevent duplicate calls in development mode
    requestSentRef.current = true;
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/issue-credential`,
        {
          connectionId: connectionId,
          username: formData.username,
          email: formData.email,
          occupation: formData.occupation,
          citizenship: formData.citizenship,
        }
      );
      console.log(response);
      setIssued(true);
    } catch (error) {
      console.log("Error creating invitation:", error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    issueCredential();
  };
  return (
    <Card className="w-full max-w-[48rem] flex-row mx-auto mt-60">
      <CardHeader
        shadow={false}
        floated={false}
        className="m-0 w-2/5 shrink-0 rounded-r-none bg-gray-100"
      >
        <Lottie
          animationData={acceptCred}
          loop={true}
          autoplay={true}
          className="w-80 h-80 ml-[-60px]"
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h6" color="gray" className="mb-4 uppercase">
          You are connected with an issuer
        </Typography>
        <Typography variant="h4" color="blue-gray" className="mb-2">
          {issued ? "Credential Issued!" : "Issue Credential"}
        </Typography>
        <Typography color="gray" className="mb-8 font-normal">
          {issued
            ? "The credential has been sent to your Bifold wallet. Please accept it to continue."
            : "Please fill in your information to issue a credential to your Bifold wallet."
          }
        </Typography>

        {!issued && (
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-4 flex flex-col gap-4">
              <Input
                size="lg"
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <Input
                size="lg"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input
                size="lg"
                label="Occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                required
              />
              <Input
                size="lg"
                label="Citizenship"
                name="citizenship"
                value={formData.citizenship}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Issue Credential
            </Button>
          </form>
        )}
      </CardBody>
      {issued && (
        <Button
          onClick={() => setActiveStep(3)}
          variant="btn"
          className="flex items-center  text-white text-[12px] w-[120px] pl-2"
        >
          Next
          <img
            src="/right.svg"
            alt="Icon"
            width="20"
            height="20"
            className="ml-2"
          />
        </Button>
      )}
    </Card>
  );
}

export default AcceptCredential;

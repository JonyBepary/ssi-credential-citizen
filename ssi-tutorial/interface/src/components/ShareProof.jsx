"use client";
import React, { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import waiting from "../../public/waiting-animation.json";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  CardFooter,
  Input,
} from "@material-tailwind/react";
import shareProof from "../../public/share-credential.json";
import axios from "axios";
import Image from "next/image";
const ShareProof = ({ isVerifier, setActiveStep, connectionId }) => {
  const [occupation, setOccupation] = useState("");
  const [citizenship, setCitizenship] = useState("");

  const requestSentRef = useRef(false);

  const proofRequestHandler = async () => {
    console.log("proofRequestHandler");
    if (requestSentRef.current) return; // Prevent duplicate calls in development mode
    requestSentRef.current = true;
    try {
      const proofResp = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/send-proof-request`,
        { proofRequestlabel: "IT Certificate", connectionId, version: "1.0" }
      );
      console.log("Proof response: ", JSON.stringify(proofResp));
      await proofStatusCheck(proofResp.data.id ?? proofResp.data.pres_ex_id);
    } catch (error) {
      console.log(error);
    }
  };

  const proofStatusCheck = async (proofRecordId) => {
    let timeoutId = null;
    console.log('---->>> ProofRecordId: ', proofRecordId);
    const intervalId = setInterval(async () => {
      try {
        if (proofRecordId) {
          const proofData = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/proof-data/${proofRecordId}`
          );
          console.log('------>>> Proof data: ', JSON.stringify(proofData));

          const presentation = proofData.data.presentation?.anoncreds ?? proofData.data.by_format?.pres?.indy ?? undefined;

          console.log('presentation data: ', JSON.stringify(presentation));

          if (presentation) {
            console.log("revealed attributes", presentation);

            // Extract occupation attribute
            const occupationValue = presentation.requested_proof
              ?.revealed_attr_groups?.occupation_attr?.values?.occupation?.raw;
            if (occupationValue) {
              setOccupation(occupationValue);
            }

            // Extract citizenship attribute
            const citizenshipValue = presentation.requested_proof
              ?.revealed_attr_groups?.citizenship_attr?.values?.citizenship?.raw;
            if (citizenshipValue) {
              setCitizenship(citizenshipValue);
            }

            clearInterval(intervalId);
            clearTimeout(timeoutId);
          }
        }
      } catch (error) {
        console.log('Error: ', error);
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      }
    }, 2000);

    timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 300000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  };

  useEffect(() => {
    proofRequestHandler();
  });
  return (
    <Card className="w-full max-w-[60rem] flex-row mx-auto mt-40">
      <CardHeader
        shadow={false}
        floated={false}
        className="m-0 w-2/5 shrink-0 rounded-r-none bg-gray-100 flex  items-center"
      >
        <Lottie
          animationData={shareProof}
          loop={true}
          autoplay={true}
          className="w-80 h-80 mx-auto"
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h6" color="gray" className="mb-4 uppercase">
          You are connected with a {isVerifier ? "verifier" : "issuer"}
        </Typography>
        <Typography variant="h4" color="blue-gray" className="mb-2">
          Share Proof Of The Credential From Your Wallet
        </Typography>
        <Typography color="gray" className="mb-8 font-normal">
          The  {isVerifier ? "verifier" : "issuer"} has sent you a proof request to your bifold wallet.
          Please share proof of the certificate.
        </Typography>
        <Card color="transparent" shadow={false}>
          <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Occupation{" "}
                {occupation.length === 0 && (
                  <Image
                    src="/icons-loading.gif"
                    alt="loading"
                    width={20}
                    height={20}
                    className="inline-block "
                    unoptimized
                  />
                )}
              </Typography>
              <Input
                size="lg"
                placeholder="Shared occupation attribute"
                value={occupation}
                disabled
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              />
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Citizenship{" "}
                {citizenship.length === 0 && (
                  <Image
                    src="/icons-loading.gif"
                    alt="loading"
                    width={20}
                    height={20}
                    className="inline-block "
                    unoptimized
                  />
                )}
              </Typography>
              <Input
                size="lg"
                value={citizenship}
                disabled
                placeholder="Shared citizenship attribute"
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              />
            </div>
          </form>
        </Card>
      </CardBody>
      <CardFooter className="flex flex-1 justify-center h-">
        <Button
          onClick={() => {
            console.log("tadaa");
            setActiveStep((prev) => prev + 1);
          }}
          variant="btn"
          className="flex items-center  text-white text-[12px]"
        >
          Next
          <img
            src="/right.svg"
            alt="Icon"
            width="20"
            height="20"
            className="ml-1 inline-block"
          />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShareProof;

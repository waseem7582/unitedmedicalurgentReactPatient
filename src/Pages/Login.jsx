import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  Link,
  PinInput,
  PinInputField,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import ISDCODEMODAL from "../Components/ISDCODEMODAL";
import showToast from "../Controllers/ShowToast";
import { ADD } from "../Controllers/ApiControllers";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { app } from "../Controllers/firebase.config";
import defaultISD from "../Controllers/defaultISD";

const Login = () => {

  // ---------------- NEW: Local OTP flag and test OTP ----------------
  const SKIP_RECAPTCHA = true; // Set to true for local/testing without Firebase/for live environment Set SKIP_RECAPTCHA = false
  const TEST_OTP = "123456";   // Test OTP for local login
  // ------------------------------------------------------------------
  const [step, setStep] = useState(1);
  const [isd_code, setIsd_code] = useState(defaultISD);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [phoneNumber, setphoneNumber] = useState();
  const [isLoading, setisLoading] = useState(false);
  const toast = useToast();
  const [OTP, setOTP] = useState();
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  const renderStep = () => {
    switch (step) {
      case 1:
        return step1({
          onOpen,
          isd_code,
          phoneNumber,
          setphoneNumber,
          handleSubmit,
          isLoading,
        });
      case 2:
        return step2({ setOTP, handleOtpSubmit: hnadleOtp, isLoading }); // If you have other steps, handle them here
      default:
        return step1({ onOpen, isd_code });
    }
  };

  const handleSubmit = async () => {
    if (!phoneNumber) {
      showToast(toast, "error", "please enter phone number");
      return;
    }
    setisLoading(true);
    try {
      let data = {
        phone: phoneNumber,
      };
      const res = await ADD("", "re_login_phone", data);
      if (res.status === false) {
        showToast(toast, "error", "Phone Number Not Exist! , Please Signup");
        setisLoading(false);
      } else if (res.status === true) {

         // ---------------- NEW: Local OTP bypass ----------------
        if (SKIP_RECAPTCHA) {
          handleSendCode();
        } else {
          handleSendCode();
        }
        // --------------------------------------------------------

        // if (phoneNumber == "1234567890") {
        //   ConfirmLogin();
        // } else {
        //   handleSendCode();
        // }
      }
    } catch (error) {
      showToast(toast, "error", error.message);
      setisLoading(false);
    }
  };

  const handleSendCode = async () => {

    // ---------------- NEW: Local OTP logic ----------------
    if (SKIP_RECAPTCHA) {
      toast({
        title: "Local OTP",
        description: `Your test OTP is ${TEST_OTP}`,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setConfirmationResult({ mocked: true }); // fake confirmation result
      setStep(2); // move to OTP input
      setisLoading(false);
      return;
    }
    // ------------------------------------------------------

    const auth = getAuth(app);
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );
    const appVerifier = window.recaptchaVerifier;
    try {
      let number = `${isd_code}${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, number, appVerifier);
      setisLoading(false);
      setConfirmationResult(result);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the OTP.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setStep(2);
    } catch (error) {
      setisLoading(false);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const hnadleOtp = async () => {
    if (OTP.length !== 6) {
      return toast({
        title: "Error",
        description: "Please Enter valid OTP.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    setisLoading(true);

     // ---------------- NEW: Local OTP check ----------------
    if (SKIP_RECAPTCHA) {
      if (OTP === TEST_OTP) {
        ConfirmLogin();
      } else {
        setisLoading(false);
        toast({
          title: "Invalid OTP",
          description: `Enter the test OTP ${TEST_OTP} for local login.`,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
      return;
    }
    // -------------------------------------------------------

    if (OTP === 123456 || OTP === "123456") {
      ConfirmLogin();
    } else {
      try {
        const login = await confirmationResult.confirm(OTP);
        ConfirmLogin(login);
      } catch (error) {
        setisLoading(false);
        toast({
          title: "Invalid OTP",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    }
  };

  const ConfirmLogin = async () => {
    try {
      let data = {
        phone: phoneNumber,
      };
      const res = await ADD("", "login_phone", data);
      if (res.status === true) {
        setisLoading(false);
        const user = { ...res.data, token: res.token };
        localStorage.setItem("user", JSON.stringify(user));
        toast({
          title: "Login Success",
          description: `Welcome ${user.f_name} ${user.l_name}`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        navigate("/", { replace: true });
        window.location.reload();
      }
    } catch (error) {
      showToast(toast, "error", error.message);
      setisLoading(false);
    }
  };

  return (
    <Flex
      minH="50vh"
      alignItems="center"
      justifyContent="center"
      bg="gray.100"
      padding="4"
    >
      <div id="recaptcha-container"></div>
      <Box
        width={["100%", "80%", "70%", "60%"]} // Responsive width for different screen sizes
        maxWidth="900px"
        boxShadow="lg"
        backgroundColor="white"
        borderRadius="md"
        overflow="hidden"
      >
        <Flex direction={["column", "column", "row", "row"]}>
          <Box
            width={["100%", "100%", "50%", "50%"]} // Responsive width for the left section
            backgroundColor="primary.main"
            color="white"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            padding={["6", "8", "8", "10"]} // Responsive padding
            textAlign="center" // Center text alignment for smaller screens
          >
            <Heading size={["md", "lg", "lg", "lg"]} mb="4">
              Login
            </Heading>
            <Text fontSize={["md", "lg", "lg", "lg"]} mb="6">
              We provide the best and most affordable healthcare services.
            </Text>
            <Image
              src="/medical-report.png"
              alt="Login Illustration"
              boxSize={["100px", "120px", "150px", "150px"]} // Responsive image size
              mb="4"
            />
          </Box>
          {renderStep()}
          {/* Right Section */}
        </Flex>
      </Box>

      <ISDCODEMODAL
        isOpen={isOpen}
        onClose={onClose}
        setisd_code={setIsd_code}
      />
    </Flex>
  );
};

const step1 = ({
  onOpen,
  isd_code,
  phoneNumber,
  setphoneNumber,
  handleSubmit,
  isLoading,
}) => (
  <Box width={["100%", "100%", "50%", "50%"]} p={["6", "8", "8", "10"]}>
    <Text fontSize="md" mb="2" fontWeight={600}>
      Mobile number
    </Text>
    <InputGroup size={"md"}>
      <InputLeftAddon
        cursor={"pointer"}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        {isd_code}
      </InputLeftAddon>
      <Input
        mb="4"
        type="tel"
        value={phoneNumber}
        onChange={(e) => {
          setphoneNumber(e.target.value);
        }}
      />
    </InputGroup>

    <Button
      colorScheme="orange"
      width="100%"
      mb="4"
      onClick={handleSubmit}
      isLoading={isLoading}
    >
      Request OTP
    </Button>
    <Text fontSize="sm" textAlign="center" mb="4">
      By continuing, you agree to our{" "}
      <Link color="blue.500" as={RouterLink} to={"/terms"}>
        Terms of Use
      </Link>{" "}
      and{" "}
      <Link color="blue.500" as={RouterLink} to={"/privacy-and-policy"}>
        Privacy Policy
      </Link>
    </Text>
    <Link
      color="blue.500"
      textAlign="center"
      display="block"
      as={RouterLink}
      to={"/signup"}
    >
      New here? Create an account
    </Link>
  </Box>
);
const step2 = ({ setOTP, handleOtpSubmit, isLoading }) => (
  <Box width={["100%", "100%", "50%", "50%"]} p={["6", "8", "8", "10"]}>
    <Text fontSize="md" mb="2" fontWeight={600}>
      Enter OTP
    </Text>
    <HStack justify={"space-between"}>
      <PinInput
        type="number"
        onComplete={(value) => {
          setOTP(value);
        }}
      >
        <PinInputField />
        <PinInputField />
        <PinInputField />
        <PinInputField />
        <PinInputField />
        <PinInputField />
      </PinInput>
    </HStack>

    <Button
      mt={5}
      colorScheme="orange"
      width="100%"
      mb="4"
      onClick={handleOtpSubmit}
      isLoading={isLoading}
    >
      Login
    </Button>
  </Box>
);

export default Login;

// import { Box } from "@chakra-ui/react";
// import React, { useEffect } from "react";

// function Login() {
//   useEffect(() => {
//     // Define the OTPless callback
//     window.otpless = (otplessUser) => {
//
//       if (otplessUser) {
//
//       } else {
//         console.error("OTPless user data not received.");
//       }
//     };

//     // Load the OTPless script dynamically
//     const script = document.createElement("script");
//     script.src = "https://otpless.com/v2/auth.js";
//     script.setAttribute("data-appid", "RCGFU4NEOX7CFZDH0K09"); // Ensure the app ID is correct
//     script.async = true;
//     document.body.appendChild(script);

//     // Cleanup the script when component unmounts
//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   return (
//     <Box mt={5}>
//       <div id="otpless-login-page"></div>
//     </Box>
//   );
// }

// export default Login;

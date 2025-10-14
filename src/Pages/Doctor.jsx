// @ts-nocheck
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { GET } from "../Controllers/ApiControllers";
import { useQuery } from "@tanstack/react-query";
import Loading from "../Components/Loading";
import imageBaseURL from "../Controllers/image";
import { BiCalendar } from "react-icons/bi";
import { MdLocalHospital } from "react-icons/md"; // Add this import
import {
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaUserAlt,
} from "react-icons/fa";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MdHandshake } from "react-icons/md";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { GrEmergency } from "react-icons/gr";
import RatingStars from "../Hooks/RatingStars";
import user from "../Controllers/user";
import LoginModal from "../Components/LoginModal";
import currency from "../Controllers/currency";
import DoctorReviews from "../Components/DoctorReviews";
import useSettingsData from "../Hooks/SettingData";

// const feeData = [
//   {
//     id: 1,
//     title: "OPD",
//     fee: 400,
//     service_charge: 0,
//     created_at: "2024-01-28 12:39:29",
//     updated_at: "2024-08-10 13:29:27",
//   },
//   {
//     id: 2,
//     title: "Video Consultant",
//     fee: 250,
//     service_charge: 20,
//     created_at: "2024-01-28 12:40:11",
//     updated_at: "2024-01-28 12:40:11",
//   },
//   {
//     id: 3,
//     title: "Emergency",
//     fee: 500,
//     service_charge: 30,
//     created_at: "2024-01-28 12:40:11",
//     updated_at: "2024-08-10 13:29:39",
//   },
// ];

const feeData = [
  {
    id: 1,
    title: "Telehealth",
    fee: 350,
    service_charge: 10,
  },
  {
    id: 2,
    title: "Video Consultant", // shows as "Video Call" in UI
    fee: 250,
    service_charge: 20,
  },
  {
    id: 3,
    title: "Clinic Visit", // was OPD before
    fee: 400,
    service_charge: 0,
  },
  {
    id: 4,
    title: "Out Call",
    fee: 600,
    service_charge: 30,
  },
];
                    
export default function Doctor() {
  const { id } = useParams();
  const [doctor, setdoctor] = useState();
  const [appointmentType, setappointmentType] = useState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { settingsData } = useSettingsData();
  const stopBooking = settingsData?.find(
    (value) => value.id_name === "stop_booking"
  );

  const getData = async () => {
    const res = await GET(`get_doctor/${id}`);
    return res.data;
  };
  const { isLoading, data } = useQuery({
    queryKey: ["Doctor", id],
    queryFn: getData,
  });

  //

  const isDisableTypeButton = (ID, doc) => {
    switch (ID) {
      case 1:
        return doc.video_appointment;
      case 2:
        return doc.clinic_appointment;
      case 3:
        return doc.emergency_appointment;
      case 4: // Out Call Case
      return doc.out_call_appointment; // You'll need to add this field to your doctor data
      default:
        return "Unknown Step";
    }
  };

  const getfee = (type, doc) => {
    switch (type) {
      case "OPD":
        return doc.opd_fee;
      case "Video Consultant":
        return doc.video_fee;
      case "Emergency":
        return doc.emg_fee;
      case "Out Call": // Add this case
        return doc.out_call_fee || feeData.find(f => f.title === "Out Call")?.fee || 1000;
      default:
        return doc.emg_fee;
    }
  };
  if (isLoading) return <Loading />;
  return (
    <Box>
      <Box bg={"primary.main"} p={0} py={{ base: "5", md: "10" }}>
        <Box className="container">
          <Text
            fontFamily={"Quicksand, sans-serif"}
            fontSize={{ base: 32, md: 48 }}
            fontWeight={700}
            textAlign={"center"}
            mt={0}
            color={"#fff"}
          >
            Doctor Profile
          </Text>
        </Box>
      </Box>{" "}
      <Box className="container" mt={10} pb={10}>
        {" "}
        <Flex gap={10} flexDir={{ base: "column", md: "row" }}>
          <Box
            backgroundColor={"#FFF"}
            borderRadius={10}
            boxShadow={"2px 2px 20px 0 rgb(82 66 47 / 12%)"}
            w={{ base: "100%", md: "40%" }}
            p={2}
          >
            <Box
              overflow={"hidden"}
              w={"100%"}
              borderRadius={data.image ? "2%" : "2%"}
            >
              {" "}
              <Image
                src={
                  data.image
                    ? `${imageBaseURL}/${data.image}`
                    : "https://plus.unsplash.com/premium_photo-1661764878654-3d0fc2eefcca?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D"
                }
                w={"100%"}
                h={"500"}
                objectFit="cover"
                objectPosition={"top"}
              />
            </Box>
            <Box px={2}>
              <Text
                mt={4}
                fontSize={{
                  base: "16px",
                  md: "16px",
                  lg: "16px",
                }}
                fontWeight={700}
                color={"gray.500"}
                fontFamily={"Quicksand, sans-serif"}
              >
                {data.department_name}
              </Text>{" "}
              <Text
                fontSize={18}
                fontWeight={800}
                fontFamily={"Quicksand, sans-serif"}
              >
                {data.f_name} {data.l_name}
              </Text>
              <Text
                as={"span"}
                display={"flex"}
                gap={1}
                alignItems={"center"}
                fontSize={14}
                color={"#000"}
                fontWeight={700}
              >
                {data.ex_year}+ Years Of Experience
              </Text>
              <Text as={"span"} display={"flex"} gap={1} alignItems={"center"}>
                <RatingStars rating={data.average_rating} />{" "}
                <Text
                  as={"span"}
                  mb={0}
                  color={"#000"}
                  fontSize={"xs"}
                  fontWeight={600}
                >
                  {parseFloat(data.average_rating).toFixed(1)} (
                  {data.number_of_reviews})
                </Text>
              </Text>
              <Flex justify={"space-between"} mt={1}>
                <Text
                  fontSize={12}
                  fontFamily={"Quicksand, sans-serif"}
                  fontWeight={600}
                  color={"gray.500"}
                  display={"flex"}
                  align={"center"}
                  gap={2}
                >
                  <FaUserAlt fontSize={12} />{" "}
                  <Text mt={-0.5}>
                    {data.total_appointment_done} Appointments Done
                  </Text>
                </Text>
              </Flex>
              <Divider my={2} />
              <Text
                mt={"2px"}
                fontSize={{
                  base: "13px",
                  md: "13px",
                  lg: "13px",
                }}
                fontWeight={500}
                m={0}
                color={"gray.600"}
                display={"flex"}
                align={"center"}
                gap={2}
                letterSpacing={1}
              >
                <Text
                  as={"span"}
                  m={0}
                  className="ion-android-call"
                  color={"#000"}
                ></Text>{" "}
                {data.isd_code} {data.phone}
              </Text>
              <Text
                fontSize={{
                  base: "13px",
                  md: "13px",
                  lg: "13px",
                }}
                fontWeight={500}
                m={0}
                color={"gray.600"}
                display={"flex"}
                align={"center"}
                gap={2}
                letterSpacing={1}
                mt={2}
              >
                <Text
                  as={"span"}
                  className="ion-ios-email"
                  fontSize={16}
                  color={"#000"}
                ></Text>{" "}
                {data.email}
              </Text>
              {data?.stop_booking === 1 ||
                stopBooking.value === true ||
                (stopBooking.value === "true" && (
                  <Alert status="error" size={"xs"} py={1} px={1} mt={4}>
                    <AlertIcon />
                    <AlertTitle fontSize={"xs"}>
                      {" "}
                      Currently Not Accepting Appointments
                    </AlertTitle>
                  </Alert>
                ))}
              <Button
                mt={5}
                colorScheme="blue"
                w={"100%"}
                size={"sm"}
                leftIcon={<BiCalendar />}
                onClick={() => {
                  if (user) {
                    setdoctor(data);
                  } else {
                    onOpen();
                  }
                }}
                isDisabled={
                  data?.stop_booking === 1 ||
                  stopBooking.value === true ||
                  stopBooking.value === "true"
                }
              >
                Make Appointment
              </Button>
              <AnimatePresence>
                {doctor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Box mt={2}>
                      <Text fontSize={14} fontWeight={600}>
                        Select Appointment Type
                      </Text>
                      <Flex gap={3} mt={2}>
                        {feeData.map((fee) => (
                          <Box
                            key={fee.id}
                            padding={4}
                            borderRadius={8}
                            minW={100}
                            color={
                              appointmentType?.id === fee.id
                                ? "#fff"
                                : isDisableTypeButton(fee?.id, data) === 1
                                ? "#fff"
                                : "#fff"
                            }
                            bg={
                              appointmentType?.id === fee.id
                                ? "primary.text"
                                : isDisableTypeButton(fee?.id, data) === 1
                                ? "primary.bg"
                                : "gray.300"
                            }
                            cursor={
                              isDisableTypeButton(fee?.id, data) === 1
                                ? "pointer"
                                : "not-allowed"
                            }
                            onClick={(e) => {
                              if (isDisableTypeButton(fee?.id, data) === 0) {
                                e.stopPropagation();
                                return;
                              }
                              e.stopPropagation();
                              setappointmentType(
                                appointmentType?.id === fee?.id ? null : fee
                              );
                              navigate(
                                `/book-appointment/${doctor.user_id}/${fee.id}`
                              );
                            }}
                          >
                            {fee.id == 1 ? (
                              <MdHandshake fontSize={28} />
                            ) : fee.id == 2 ? (
                              <BsFillCameraVideoFill fontSize={28} />
                            ) : fee.id == 3 ? (
                              <GrEmergency fontSize={28} />
                            ) : fee.id == 4 ? (
                              <MdLocalHospital fontSize={28} /> // Add icon for Out Call
                            ) : null}
                            <Text
                              mt={5}
                              fontSize={{ base: "12px", md: "13px" }}
                              fontWeight={500}
                              m={0}
                            >
                              {fee.id === 2 ? "Video Call" : 
                               fee.id === 3 ? "Clinic Visit" : 
                               fee.title
                              }
                            </Text>
                            <Text
                              mt={5}
                              fontSize={{ base: "12px", md: "13px" }}
                              fontWeight={500}
                              m={0}
                            >
                              {getfee(fee.title, data)} {currency}
                            </Text>
                          </Box>
                        ))}
                      </Flex>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
              <Divider my={3} />
              <HStack spacing={2}>
                <IconButton
                  as="a"
                  href={data.insta_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  icon={<FaInstagram />}
                  variant="ghost"
                  colorScheme="pink"
                />{" "}
                <IconButton
                  as="a"
                  href={data.fb_linik}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  icon={<FaFacebook />}
                  variant="ghost"
                  colorScheme="facebook"
                />
                <IconButton
                  as="a"
                  href={data.twitter_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  icon={<FaTwitter />}
                  variant="ghost"
                  colorScheme="twitter"
                />{" "}
                <IconButton
                  as="a"
                  href={data.you_tube_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  icon={<FaYoutube />}
                  variant="ghost"
                  colorScheme="red"
                />
              </HStack>
            </Box>
          </Box>
          <Box
            backgroundColor={"#FFF"}
            borderRadius={10}
            cursor={"pointer"}
            boxShadow={"2px 2px 20px 0 rgb(82 66 47 / 12%)"}
            w={{ base: "100%", md: "60%" }}
            p={4}
          >
            <Text
              fontSize={24}
              fontWeight={800}
              fontFamily={"Roboto, sans-serif"}
            >
              {data.f_name} {data.l_name}
            </Text>
            <Text
              fontSize={14}
              textAlign={"justify"}
              mt={4}
              fontFamily={"Quicksand, sans-serif"}
              color={"gray.600"}
            >
              {data.description ? data.description : ""}
            </Text>
            <Divider my={3} />
            <Flex align={"center"}>
              <Text
                mt={"2px"}
                fontSize={16}
                fontWeight={700}
                m={0}
                color={"primary.text"}
                fontFamily={"Quicksand, sans-serif"}
                w={"50%"}
              >
                Department
              </Text>
              <Text
                mt={"2px"}
                fontSize={16}
                fontWeight={700}
                m={0}
                color={"gray.900"}
                fontFamily={"Quicksand, sans-serif"}
                w={"50%"}
              >
                {data.department_name}
              </Text>
            </Flex>
            <Divider my={3} />
            <Flex align={"center"}>
              <Text
                mt={"2px"}
                fontSize={16}
                fontWeight={700}
                m={0}
                color={"primary.text"}
                fontFamily={"Quicksand, sans-serif"}
                w={"50%"}
              >
                Specialization
              </Text>
              <Text
                mt={"2px"}
                fontSize={16}
                fontWeight={700}
                m={0}
                color={"gray.900"}
                fontFamily={"Quicksand, sans-serif"}
                w={"50%"}
              >
                {data.specialization}
              </Text>
            </Flex>
            <Divider my={3} />
            <Flex align={"center"}>
              <Text
                mt={"2px"}
                fontSize={16}
                fontWeight={700}
                m={0}
                color={"primary.text"}
                fontFamily={"Quicksand, sans-serif"}
                w={"50%"}
              >
                Experience
              </Text>
              <Text
                mt={"2px"}
                fontSize={16}
                fontWeight={700}
                m={0}
                color={"gray.900"}
                fontFamily={"Quicksand, sans-serif"}
                w={"50%"}
              >
                {data.ex_year}+ Years
              </Text>
            </Flex>
            <Divider my={3} />
            <DoctorReviews id={id} />
          </Box>
        </Flex>
      </Box>
      {isOpen && <LoginModal isModalOpen={isOpen} onModalClose={onClose} />}
    </Box>
  );
}

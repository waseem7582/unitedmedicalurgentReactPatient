import { MdOutlineLogin } from "react-icons/md";
import { IoMdRefresh } from "react-icons/io";
import { TbBrandZoom } from "react-icons/tb";
/* eslint-disable react/prop-types */
import { AiOutlineRight } from "react-icons/ai";
import { FaDirections, FaFileDownload, FaExternalLinkAlt } from "react-icons/fa";
import { AiOutlineDownload } from "react-icons/ai";
import { FaUserAlt } from "react-icons/fa";
import {
  Box,
  Flex,
  Text,
  Avatar,
  Badge,
  Button,
  HStack,
  Divider,
  InputGroup,
  InputLeftElement,
  Input,
  Image,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  useToast,
  Link,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loading from "../Components/Loading";
import { ADD, GET } from "../Controllers/ApiControllers";
import imageBaseURL from "../Controllers/image";
import { CalendarIcon } from "@chakra-ui/icons";
import { useRef, useState, useEffect } from "react";
import user from "../Controllers/user";
import showToast from "../Controllers/ShowToast";
import api from "../Controllers/api";
import printPDF from "../Controllers/printPDF";
import getStatusBadge from "../Hooks/StatusBadge";
import RatingStars from "../Hooks/RatingStars";
import AddDoctorReview from "../Components/AddDoctorReview";
import useSettingsData from "../Hooks/SettingData";
import { AnimatePresence, motion } from "framer-motion";
import { GoFileSubmodule } from "react-icons/go";

const formatDate = (dateString) => {
  const date = moment(dateString);
  return {
    month: date.format("MMM"),
    date: date.format("DD"),
    year: date.format("YYYY"),
  };
};

function openFile(url) {
  const finalURL = `${imageBaseURL}/${url}`;
  window.open(finalURL, "_blank");
}

// ADD THIS FUNCTION - Decodes Unicode addresses
const decodeUnicodeAddress = (address) => {
  if (!address) return '';
  
  return address
    .replace(/\\ud83d\\udccd/g, '📍')  // Location pin emoji
    .replace(/\\ud83d\\uddfa\\ufe0f/g, '🗺️')  // World map emoji  
    .replace(/\\ud83d\\ude97/g, '🚗')  // Car emoji
    .replace(/\\r\\n/g, '\n')  // Fix line breaks
    .replace(/\\\//g, '/');  // Fix escaped slashes
};

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { settingsData } = useSettingsData();
  const latitude = settingsData?.find(
    (value) => value.id_name === "clinic_location_latitude"
  );
  const longitude = settingsData?.find(
    (value) => value.id_name === "clinic_location_longitude"
  );
  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: ratingIsOpen,
    onOpen: ratingOnOpen,
    onClose: ratingOnClose,
  } = useDisclosure();
  const cancelRef = useRef();
  
  // State for location data
  const [locationData, setLocationData] = useState(null);

  // UPDATED: Function to extract coordinates from out_call_address
  const extractLocationData = (outCallAddress) => {
    if (!outCallAddress) {
      console.log("No out_call_address provided");
      return null;
    }
    
    console.log("Raw Out Call Address:", outCallAddress);
    
    // Method 1: Extract from Google Maps URL (most reliable)
    const urlMatch = outCallAddress.match(/https:\/\/www\.google\.com\/maps\?q=([-\d.]+),([-\d.]+)/);
    if (urlMatch) {
      console.log("✅ Found coordinates in Google Maps URL");
      const lat = urlMatch[1];
      const lng = urlMatch[2];
      return {
        latitude: lat,
        longitude: lng,
        mapsUrl: urlMatch[0],
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      };
    }
    
    // Method 2: Extract coordinates directly using more flexible patterns
    const latMatch = outCallAddress.match(/Latitude:\s*([-\d.]+)/);
    const lngMatch = outCallAddress.match(/Longitude:\s*([-\d.]+)/);
    
    if (latMatch && lngMatch) {
      console.log("✅ Found coordinates in text format");
      const lat = latMatch[1];
      const lng = lngMatch[1];
      return {
        latitude: lat,
        longitude: lng,
        mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      };
    }
    
    console.log("❌ No coordinates found");
    return null;
  };

  const getData = async () => {
    const res = await GET(`get_appointment/${id}`);
    return res.data;
  };
  
  // UPDATED: onSuccess callback with better logging
  const { isLoading, data: appointmentData } = useQuery({
    queryKey: ["appointment", id],
    queryFn: getData,
    onSuccess: (data) => {
      console.log("📱 Appointment data loaded:", data);
      
      // Extract location data when appointment type is Out Call
      if (data?.type === "Out Call") {
        console.log("🏠 Out Call appointment detected");
        
        // Decode the address first to see what we're working with
        const decodedAddress = decodeUnicodeAddress(data.out_call_address);
        console.log("🔍 Decoded address:", decodedAddress);
        
        const extractedLocationData = extractLocationData(data.out_call_address);
        console.log("🎯 Extracted location data:", extractedLocationData);
        
        setLocationData(extractedLocationData);
      }
    }
  });

  // req history
  const getReqData = async () => {
    const res = await GET(`get_appointment_cancel_req/appointment/${id}`);
    return res.data;
  };
  const getInvoices = async () => {
    const res = await GET(`get_invoice/appointment/${id}`);
    return res.data;
  };
  const getPrescription = async () => {
    const res = await GET(`get_prescription/appointment/${id}`);
    return res.data;
  };
  const getQueueNumber = async () => {
    const res = await GET(
      `get_appointment_check_in_doct_date/${appointmentData?.doct_id}/${appointmentData?.date}`
    );
    return res.data;
  };
  const getPatientFiles = async () => {
    const res = await GET(
      `get_patient_file/patient/${appointmentData?.patient_id}`
    );
    return res.data;
  };

  const { isLoading: reqHistoryLoading, data: reqHistoryData } = useQuery({
    queryKey: ["appointment-req-history", id],
    queryFn: getReqData,
  });
  const { isLoading: invoiceLoading, data: invoiceData } = useQuery({
    queryKey: ["invoice", id],
    queryFn: getInvoices,
  });
  const { isLoading: prescriptionLoading, data: prescriptionData } = useQuery({
    queryKey: ["prescription", id],
    queryFn: getPrescription,
  });
  const {
    isFetching: queueIsFetching,
    data: queueData,
    refetch,
  } = useQuery({
    queryKey: ["queue", appointmentData?.doct_id, appointmentData?.date],
    queryFn: getQueueNumber,
    enabled: !!appointmentData,
  });

  const { isLoading: patientFilesLoading, data: patientFilesData } = useQuery({
    queryKey: ["patient-files", appointmentData?.patient_id],
    queryFn: getPatientFiles,
    enabled: !!appointmentData,
  });

  const { month, date, year } = formatDate(appointmentData?.date);
  const queueNumb = queueData?.findIndex((queue) => {
    return queue?.appointment_id == id;
  });

  if (
    isLoading ||
    reqHistoryLoading ||
    invoiceLoading ||
    prescriptionLoading ||
    queueIsFetching ||
    patientFilesLoading
  )
    return <Loading />;
    
  return (
    <Box>
      <Box bg={"primary.main"} p={4} py={{ base: "4", md: "10" }}>
        <Box className="container">
          <Text
            fontFamily={"Quicksand, sans-serif"}
            fontSize={{ base: 24, md: 32 }}
            fontWeight={700}
            textAlign={"center"}
            mt={0}
            color={"#fff"}
          >
            Appointment #{id}
          </Text>
        </Box>
      </Box>
      <Box className="container" minH={"80vh"}>
        <Flex justify={"center"}>
          <Box
            p={[2, 4, 5]}
            shadow="lg"
            borderWidth="1px"
            borderRadius="lg"
            mx="auto"
            bg="white"
            mt={10}
            w={600}
            maxW={"100vw"}
          >
            <Flex alignItems="center" mb={5}>
              <Avatar
                size="xl"
                src={`${imageBaseURL}/${appointmentData.doct_image}`}
              />
              <Box ml={3}>
                <Text fontSize="lg" fontWeight="bold">
                  {appointmentData.doct_f_name} {appointmentData.doct_l_name}
                </Text>
                <Text
                  fontWeight={600}
                  color={"gray.600"}
                  fontSize={["sm", "sm"]}
                >
                  {appointmentData.doct_specialization}
                </Text>
                <Text
                  fontWeight={600}
                  color={"gray.600"}
                  fontSize={["sm", "sm"]}
                >
                  {appointmentData.dept_title}
                </Text>
                <Text
                  fontWeight={600}
                  color={"gray.600"}
                  fontSize={["xs", "xs"]}
                  display={"flex"}
                  gap={2}
                  alignItems={"center"}
                >
                  <RatingStars rating={appointmentData.average_rating} /> (
                  {appointmentData.number_of_reviews})
                </Text>
                <Text
                  fontWeight={600}
                  color={"gray.600"}
                  fontSize={["xs", "xs"]}
                  display={"flex"}
                  align={"center"}
                  gap={2}
                  mt={1}
                >
                  <FaUserAlt fontSize={12} />{" "}
                  <Text mt={"-2px"}>
                    {appointmentData.total_appointment_done}+ Happy Clients
                  </Text>
                </Text>
              </Box>
            </Flex>
            {appointmentData?.status === "Visited" ||
            appointmentData?.status === "Completed" ? (
              <Button
                colorScheme="blue"
                variant="solid"
                width="100%"
                size="xs"
                onClick={ratingOnOpen}
              >
                Review Doctor
              </Button>
            ) : (
              <Divider />
            )}
            {appointmentData.type === "OPD" &&
            appointmentData?.status === "Confirmed" ? (
              queueNumb >= 0 ? (
                <Button
                  fontWeight={600}
                  color={"#fff"}
                  mt={2}
                  bg={"green.700"}
                  _hover={{
                    bg: "green.700",
                  }}
                  size={"sm"}
                  rightIcon={<IoMdRefresh fontSize={18} />}
                  onClick={() => {
                    queryClient.invalidateQueries([
                      "queue",
                      appointmentData?.doct_id,
                      appointmentData?.date,
                    ]);
                    refetch();
                  }}
                >
                  {`Queue Number. - ${queueNumb + 1}`}
                </Button>
              ) : (
                <Button
                  fontWeight={600}
                  color={"#fff"}
                  mt={2}
                  bg={"green.700"}
                  _hover={{
                    bg: "green.700",
                  }}
                  size={"sm"}
                  rightIcon={<MdOutlineLogin fontSize={18} />}
                  onClick={() => {
                    navigate(`/appointment-success/${id}`);
                  }}
                >
                  Check-In
                </Button>
              )
            ) : null}

            <Flex align={"center"} justify={"space-between"} mt={5}>
              <Text fontWeight="bold" color={"gray.600"}>
                Appointment #{appointmentData.id}
              </Text>
              {getStatusBadge(appointmentData?.status)}
            </Flex>
            <Box>
              <Text fontWeight={600} color={"gray.600"} fontSize={"sm"}>
                Patient : {appointmentData.patient_f_name}{" "}
                {appointmentData.patient_l_name}
              </Text>
              <Badge
                colorScheme={
                  appointmentData.type === "Emergency" ? "red" : "green"
                }
                fontSize={{ base: "xs", md: "xs" }}
                fontWeight={800}
              >
                {appointmentData.type}
              </Badge>
            </Box>
            <Divider my={2} />
            
            {/* UPDATED: Out Call Location Information */}
            {appointmentData?.type === "Out Call" && (
              <Box mt={3} p={3} bg="blue.50" borderRadius="md">
                <Text fontWeight="bold" mb={2}>📍 Patient Location Details</Text>
                
                {/* Decoded Address Display */}
                {/* {appointmentData.out_call_address && (
                  <Box mb={3} p={2} bg="white" borderRadius="md">
                    <Text fontSize="sm" fontWeight={600} mb={1}>Shared Location:</Text>
                    <Text fontSize="xs" color="gray.700" whiteSpace="pre-wrap" fontFamily="monospace">
                      {decodeUnicodeAddress(appointmentData.out_call_address)}
                    </Text>
                  </Box>
                )} */}
                
                <Text fontSize="sm" mb={1}>
                  <strong>City:</strong> {appointmentData.out_call_city}
                </Text>
                
                {appointmentData.out_call_landmark && (
                  <Text fontSize="sm" mb={1}>
                    <strong>Landmark:</strong> {appointmentData.out_call_landmark}
                  </Text>
                )}
                
                {appointmentData.out_call_instructions && (
                  <Text fontSize="sm" mb={2}>
                    <strong>Instructions:</strong> {appointmentData.out_call_instructions}
                  </Text>
                )}
                
                {/* ALWAYS SHOW BUTTONS - They will work! */}
                <Flex gap={3} mt={3}>
                  <Button
                    leftIcon={<FaExternalLinkAlt />}
                    colorScheme="blue"
                    size="sm"
                    onClick={() => {
                      // Extract coordinates on click to ensure fresh data
                      const coords = extractLocationData(appointmentData.out_call_address);
                      if (coords) {
                        window.open(coords.mapsUrl, "_blank");
                      } else {
                        alert("Could not extract location coordinates from address.");
                      }
                    }}
                    flex="1"
                  >
                    View in Maps
                  </Button>
                  
                  <Button
                    leftIcon={<FaDirections />}
                    colorScheme="green"
                    variant="solid"
                    size="sm"
                    onClick={() => {
                      // Extract coordinates on click to ensure fresh data
                      const coords = extractLocationData(appointmentData.out_call_address);
                      if (coords) {
                        window.open(coords.directionsUrl, "_blank");
                      } else {
                        alert("Could not extract location coordinates from address.");
                      }
                    }}
                    flex="1"
                  >
                    Get Directions
                  </Button>
                </Flex>
                
                {/* Debug info - shows what we found */}
                {/* {locationData && (
                  <Text fontSize="xs" color="green.600" mt={2}>
                    <strong>✅ Coordinates found:</strong> {locationData.latitude}, {locationData.longitude}
                  </Text>
                )} */}
              </Box>
            )}
            
            <Box overflow="hidden" p={5}>
              <Flex align={"center"} justify={"space-between"} gap={5}>
                <Box flex={1}>
                  <Text>Date</Text>
                  <InputGroup w={"100%"}>
                    <InputLeftElement pointerEvents="none">
                      <CalendarIcon color="gray.800" />
                    </InputLeftElement>
                    <Input
                      variant="flushed"
                      isReadOnly
                      defaultValue={`${month} ${date} ${year}`}
                      fontWeight={600}
                      fontSize={"sm"}
                    />
                  </InputGroup>
                </Box>
                <Box flex={1}>
                  <Text>Time</Text>
                  <InputGroup w={"100%"}>
                    <InputLeftElement pointerEvents="none">
                      <CalendarIcon color="gray.800" />
                    </InputLeftElement>
                    <Input
                      variant="flushed"
                      isReadOnly
                      defaultValue={appointmentData.time_slots}
                      fontWeight={600}
                      fontSize={"sm"}
                    />
                  </InputGroup>
                </Box>
              </Flex>
            </Box>
            {appointmentData?.type === "Video Consultant" && (
              <Flex gap={4}>
                <Button
                  isDisabled={
                    appointmentData?.status === "Cancelled" ||
                    appointmentData?.status === "Rejected"
                  }
                  colorScheme="green"
                  mt={5}
                  width="100%"
                  size={"sm"}
                  leftIcon={<TbBrandZoom fontSize={"20px"} />}
                  onClick={() => {
                    window.open(appointmentData?.meeting_link, "_blank");
                  }}
                >
                  Join Meeting
                </Button>
              </Flex>
            )}
            <Divider my={2} mt={5} />
            <Box mt={5}>
              <Flex align={"center"} justify={"space-between"}>
                <Text fontWeight="bold">Prescriptions - </Text>
              </Flex>
              {prescriptionData.length ? (
                prescriptionData?.map((item, index) => (
                  <Button
                    justifyContent={"flex-start"}
                    w={"100%"}
                    key={item.id}
                    variant="link"
                    colorScheme="green"
                    rightIcon={<AiOutlineDownload fontSize={18} />}
                    onClick={() => {
                      printPDF(
                        item?.pdf_file
                          ? `${imageBaseURL}/${item?.pdf_file}`
                          : `${api}/prescription/generatePDF/${item.id}`
                      );
                    }}
                  >
                    Download Prescription #{index + 1}
                  </Button>
                ))
              ) : (
                <Alert
                  status="error"
                  size={"sm"}
                  fontSize={"sm"}
                  py={1}
                  fontWeight={600}
                  borderRadius={4}
                >
                  <AlertIcon />
                  Prescriptions Not Found!
                </Alert>
              )}
            </Box>
            <Divider my={2} mt={5} />
            <Box mt={5}>
              <Flex align={"center"} justify={"space-between"} mb={3}>
                <Text fontWeight="bold">Patient Files - </Text>
              </Flex>

              {patientFilesData.length ? (
                <AnimatePresence>
                  {patientFilesData?.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7 }}
                    >
                      <Card cursor={"pointer"} mb={4} onClick={() => {}}>
                        <CardBody p={4}>
                          <Flex align={"center"} justify={"space-between"}>
                            <Flex align={"center"} gap={4}>
                              <GoFileSubmodule fontSize={24} color="#2D3748" />
                              <Box>
                                <Text fontSize={14} fontWeight={600} mb={0}>
                                  {file.file_name}
                                </Text>
                                <Text fontSize={12} fontWeight={600}>
                                  {file.f_name} {file.l_name} |{" "}
                                  {moment(file.created_at).format(
                                    "D-MMM-YY HH:MM A"
                                  )}
                                </Text>
                              </Box>
                            </Flex>
                            <IconButton
                              icon={<FaFileDownload />}
                              colorScheme={"blue"}
                              size={"sm"}
                              onClick={(e) => {
                                e.stopPropagation();
                                openFile(file.file);
                              }}
                            />
                          </Flex>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <Alert
                  status="error"
                  size={"sm"}
                  fontSize={"sm"}
                  py={1}
                  fontWeight={600}
                  borderRadius={4}
                >
                  <AlertIcon />
                  Files Not Found!
                </Alert>
              )}
            </Box>
            <Divider my={2} mt={5} />
            <Box mt={5}>
              <Flex align={"center"} justify={"space-between"}>
                <Text fontWeight="bold">Payment Status</Text>
                <Badge colorScheme="green" fontWeight="bold" variant="solid">
                  {appointmentData?.payment_status || "Not Paid"}
                </Badge>
              </Flex>

              <Text color={"gray.600"} fontSize={"sm"} fontWeight={600}>
                Payment Id #{appointmentData.id}
              </Text>
              {invoiceData ? (
                <Button
                  variant="link"
                  colorScheme="green"
                  rightIcon={<AiOutlineDownload fontSize={18} />}
                  onClick={() => {
                    printPDF(`${api}/invoice/generatePDF/${invoiceData.id}`);
                  }}
                >
                  Download Invoice
                </Button>
              ) : null}
            </Box>
            
            <Contact 
              doctID={appointmentData?.doct_id} 
              locationData={locationData}
              appointmentType={appointmentData?.type}
            />
            
            {/* Smart Directions Button */}
            <Box mt={5}>
              {appointmentData?.type === "Out Call" && locationData ? (
                <Button
                  leftIcon={<FaDirections />}
                  colorScheme="blue"
                  variant="solid"
                  width="100%"
                  size={"sm"}
                  onClick={() => window.open(locationData.directionsUrl, "_blank")}
                >
                  Get Directions to Patient Location
                </Button>
              ) : (
                <Button
                  leftIcon={<FaDirections />}
                  colorScheme="gray"
                  variant="solid"
                  width="100%"
                  size={"sm"}
                  as={Link}
                  href={`https://www.google.com/maps?q=${latitude.value},${longitude.value}`}
                  isExternal
                >
                  Make direction to clinic location
                </Button>
              )}
            </Box>
            
            <Divider my={2} />

            {["Pending", "Confirmed", "Rescheduled", "Cancelled"].includes(
              appointmentData?.status
            ) && (
              <Box>
                <Box
                  bg={"red.400"}
                  _hover={{
                    bg: "red.500",
                  }}
                  mt={5}
                  width="100%"
                  size={"sm"}
                  as={Button}
                  color={"#000"}
                  rightIcon={<AiOutlineRight color="#fff" />}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  textAlign={"left"}
                  py={2}
                  h={"fit-content"}
                  onClick={() => {
                    if (
                      appointmentData.current_cancel_req_status ===
                        "Approved" ||
                      appointmentData.current_cancel_req_status === "Rejected"
                    ) {
                      return;
                    }
                    onOpen();
                  }}
                >
                  <Box>
                    <Text fontSize={"sm"} color={"#fff"}>
                      Appointment Cancellation
                    </Text>
                    {appointmentData.current_cancel_req_status !== "Approved" ||
                      (appointmentData.current_cancel_req_status !==
                        "Rejected" && (
                        <Text fontSize={"xs"} mt={1} color={"gray.100"}>
                          Click Here to{" "}
                          {appointmentData.current_cancel_req_status === null
                            ? "Initiate"
                            : "Delete"}{" "}
                          Cancelletion Request
                        </Text>
                      ))}

                    {appointmentData.current_cancel_req_status !== null && (
                      <Text fontSize={"xs"} mt={1} color={"gray.100"}>
                        Current status -{" "}
                        {appointmentData.current_cancel_req_status}
                      </Text>
                    )}
                  </Box>
                </Box>
                {appointmentData.current_cancel_req_status !== null && (
                  <Box bg={"gray.200"} borderRadius={"md"} px={2} py={1} mt={2}>
                    <Text fontSize={"sm"} fontWeight={600} mb={2}>
                      Request History
                    </Text>
                    {reqHistoryData?.map((item) => (
                      <ReqHistory key={item.id} item={item} />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Flex>
      </Box>
      {/* modal */}
      <DailogModal
        cancelRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}
        currentStatus={appointmentData.current_cancel_req_status}
        appointID={id}
      />
      {ratingIsOpen && (
        <AddDoctorReview
          patient_id={appointmentData?.patient_id}
          doctID={appointmentData?.doct_id}
          AppID={appointmentData?.id}
          isOpen={ratingIsOpen}
          onClose={ratingOnClose}
        />
      )}
    </Box>
  );
};

export default AppointmentDetails;

// Contact component with enhanced location menu
const Contact = ({ doctID, locationData, appointmentType }) => {
  const getData = async () => {
    const res = await GET(`get_doctor/${doctID}`);
    return res.data;
  };
  const { data } = useQuery({
    queryKey: ["Doctor", doctID],
    queryFn: getData,
  });

  const { settingsData } = useSettingsData();
  const latitude = settingsData?.find(
    (value) => value.id_name === "clinic_location_latitude"
  );
  const longitude = settingsData?.find(
    (value) => value.id_name === "clinic_location_longitude"
  );
  const ambulence_num = settingsData?.find(
    (value) => value.id_name === "ambulance_number"
  );

  return (
    <>
      {data && (
        <Box mt={5}>
          <Text fontWeight="bold">Contact Us</Text>
          <HStack spacing={8} mt={2}>
            <Button
              variant="link"
              colorScheme="gray"
              color={"gray.600"}
              display={"flex"}
              flexDir={"column"}
              as={Link}
              href={`tel:${data.isd_code}${data.phone}`}
              isExternal
            >
              <Image src="/phone.png" w={9} />
              <Text mt={2} fontSize={"sm"}>
                Phone
              </Text>
            </Button>
            <Button
              variant="link"
              colorScheme="gray"
              color={"gray.600"}
              display={"flex"}
              flexDir={"column"}
              as={Link}
              href={`https://wa.me/${data.isd_code}${data.phone}`}
              isExternal
            >
              <Image src="/whatsapp.png" w={9} />
              <Text mt={2} fontSize={"sm"}>
                Whatspp
              </Text>
            </Button>

            <Button
              variant="link"
              colorScheme="gray"
              color={"gray.600"}
              display={"flex"}
              flexDir={"column"}
              as={Link}
              isExternal
              href={`mailto:${data.email}`}
            >
              <Image src="/gmail.png" w={9} />
              <Text mt={2} fontSize={"sm"}>
                Gmail
              </Text>
            </Button>

            {/* Enhanced Location button for Out Call appointments */}
            {appointmentType === "Out Call" && locationData ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="link"
                  colorScheme="gray"
                  color={"gray.600"}
                  display={"flex"}
                  flexDir={"column"}
                >
                  <Image src="/google-maps.png" w={9} />
                  <Text mt={2} fontSize={"sm"}>
                    Location
                  </Text>
                </MenuButton>
                <MenuList>
                  <MenuItem 
                    icon={<Image src="/google-maps.png" w={5} />}
                    onClick={() => window.open(locationData.mapsUrl, "_blank")}
                  >
                    View in Maps
                  </MenuItem>
                  <MenuItem 
                    icon={<FaDirections />}
                    onClick={() => window.open(locationData.directionsUrl, "_blank")}
                  >
                    Get Directions
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                variant="link"
                colorScheme="gray"
                color={"gray.600"}
                display={"flex"}
                flexDir={"column"}
                as={Link}
                isExternal
                href={`https://www.google.com/maps?q=${latitude.value},${longitude.value}`}
              >
                <Image src="/google-maps.png" w={9} />
                <Text mt={2} fontSize={"sm"}>
                  Location
                </Text>
              </Button>
            )}

            <Button
              variant="link"
              colorScheme="gray"
              color={"gray.600"}
              display={"flex"}
              flexDir={"column"}
              as={Link}
              isExternal
              href={`tel:${ambulence_num.value}`}
            >
              <Image src="/ambulance.png" w={9} />
              <Text mt={2} fontSize={"sm"}>
                Ambulance
              </Text>
            </Button>
          </HStack>
        </Box>
      )}
    </>
  );
};

// DailogModal Component
const DailogModal = ({
  cancelRef,
  isOpen,
  onClose,
  currentStatus,
  appointID,
}) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const handleCancellation = async (data) => {
    let formData = {
      appointment_id: data.id,
      status: data.status,
    };
    try {
      const res = await ADD(user.token, data.url, formData);
      if (res.response === 200) {
        showToast(toast, "success", "Success!");
        queryClient.invalidateQueries("cartdata");
        return res;
      } else {
        showToast(toast, "error", res.message);
        return res;
      }
    } catch (error) {
      return error;
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleCancellation(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["appointment-req-history", appointID]);
      queryClient.invalidateQueries(["appointment", appointID]);
      onClose();
    },
    onError: (error) => {
      showToast(toast, "error", JSON.stringify(error));
    },
  });

  if (mutation.isPending) return <Loading />;

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent m={{ base: 2, md: 0 }}>
        <AlertDialogHeader fontSize={"md"}>
          {currentStatus === null
            ? "Cancel Appointment"
            : "Delete Cancellation Request"}{" "}
          ?
        </AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          {currentStatus === null
            ? "Are you sure , you want to cancel this appointment"
            : "Are you sure , you want to delete cancellation request"}{" "}
          ?
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose} size={"sm"} minW={20}>
            No
          </Button>
          <Button
            colorScheme="red"
            ml={3}
            size={"sm"}
            minW={20}
            onClick={() => {
              currentStatus === null
                ? mutation.mutate({
                    id: appointID,
                    status: "Initiated",
                    url: "appointment_cancellation",
                  })
                : currentStatus === "Initiated"
                ? mutation.mutate({
                    id: appointID,
                    status: "Initiated",
                    url: "delete_appointment_cancellation",
                  })
                : null;
            }}
          >
            Yes
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ReqHistory Component
const ReqHistory = ({ item }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Initiated":
        return "yellow.400";
      case "Rejected":
        return "red.500";
      case "Approved":
        return "green.500";
      case "Processing":
        return "orange.400";
      default:
        return "gray.500";
    }
  };
  return (
    <Box>
      <Flex gap={5} align={"center"}>
        <Box
          bg={getStatusColor(item.status)}
          width="8px"
          height="8px"
          borderRadius="50%"
        />
        <Box>
          <Text fontSize={"sm"} fontWeight={600}>
            {item.status}
          </Text>
          <Text fontSize={"xs"} fontWeight={500} color={"gray.600"}>
            {moment(item.created_at).format("DD-MM-YYYY hh:mm A")}
          </Text>
        </Box>
      </Flex>
      <Divider borderColor={"#fff"} my={2} borderWidth={1} />
    </Box>
  );
};
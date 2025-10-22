// src/Pages/AppointmentSuccess.jsx
import {
  Box,
  Text,
  Image,
  Flex,
  VStack,
  Heading,
  Badge,
  Divider,
  Button,
  Card,
  CardBody,
  Container,
  SimpleGrid,
  useToast
} from "@chakra-ui/react";
import { GET } from "../Controllers/ApiControllers";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Loading from "../Components/Loading";
import {
  createGoogleCalendarUrl,
  handleDownloadICalendar,
} from "../Controllers/createCalendarUrls";
import ErrorPage from "./ErrorPage";
import QRCodeComponent from "../Components/QRcode";
import MeetingQR from "../Components/MeeitngQR";
import { FaExternalLinkAlt, FaMapMarkerAlt, FaCopy, FaHome, FaDirections } from "react-icons/fa";
import { useState, useEffect } from "react";

const AppointmentSuccess = () => {
  const { id } = useParams();
  const [placeName, setPlaceName] = useState(null);
  const [isLoadingPlace, setIsLoadingPlace] = useState(false);
  const toast = useToast();
  
  // COMPREHENSIVE TYPE MAPPING - Backend types to Display names
  const typeConfig = {
    'Emergency': {
      displayName: 'Clinic Visit',
      badgeColor: 'green',
      message: "Visit the clinic and scan the provided QR code to instantly generate your appointment queue number",
      showQR: true,
      showMeeting: false
    },
    'Video Consultant': {
      displayName: 'Video Call',
      badgeColor: 'blue',
      message: "Click join meeting or scan the QR code to join the meeting.",
      showQR: true,
      showMeeting: true
    },
    'OPD': {
      displayName: 'Telehealth',
      badgeColor: 'red',
      message: "Your telehealth appointment has been confirmed. Please be ready for the virtual consultation.",
      showQR: false,
      showMeeting: false
    },
    'Out Call': {
      displayName: 'Out Call',
      badgeColor: 'purple',
      message: "The doctor will visit your given address. Please make sure someone is there.",
      showQR: false,
      showMeeting: false
    }
  };

  const getTypeConfig = (backendType) => {
    return typeConfig[backendType] || {
      displayName: backendType,
      badgeColor: 'gray',
      message: "Your appointment has been confirmed.",
      showQR: false,
      showMeeting: false
    };
  };

  // Extract coordinates and map links from location text - ONLY FOR OUT CALL
  const extractLocationData = (locationText) => {
    if (!locationText) return null;
    
    const urlMatch = locationText.match(/https:\/\/www\.google\.com\/maps\?q=([-\d.]+),([-\d.]+)/);
    const directionsMatch = locationText.match(/https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=([-\d.]+),([-\d.]+)/);
    
    if (urlMatch) {
      return {
        latitude: urlMatch[1],
        longitude: urlMatch[2],
        mapsUrl: urlMatch[0],
        directionsUrl: directionsMatch ? directionsMatch[0] : `https://www.google.com/maps/dir/?api=1&destination=${urlMatch[1]},${urlMatch[2]}`
      };
    }
    
    // Fallback: extract coordinates from text
    const latMatch = locationText.match(/Latitude:\s*([-\d.]+)/);
    const lngMatch = locationText.match(/Longitude:\s*([-\d.]+)/);
    
    if (latMatch && lngMatch) {
      const lat = latMatch[1];
      const lng = lngMatch[1];
      return {
        latitude: lat,
        longitude: lng,
        mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      };
    }
    
    return null;
  };

  // Get place name from coordinates using Reverse Geocoding
  const getPlaceName = async (lat, lng) => {
    try {
      setIsLoadingPlace(true);
      // Using OpenStreetMap Nominatim API (FREE, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        // Try to get the most specific address first, then fallback to more general
        const address = data.address;
        let placeName = '';
        
        if (address.road && address.house_number) {
          placeName = `${address.road} ${address.house_number}`;
        } else if (address.road) {
          placeName = address.road;
        } else if (address.suburb) {
          placeName = address.suburb;
        } else if (address.neighbourhood) {
          placeName = address.neighbourhood;
        } else if (address.city) {
          placeName = address.city;
        } else if (address.town) {
          placeName = address.town;
        } else if (address.village) {
          placeName = address.village;
        } else if (address.county) {
          placeName = address.county;
        } else if (address.state) {
          placeName = address.state;
        } else {
          placeName = 'Unknown Location';
        }
        
        // Add city if available for better context
        if (address.city && address.city !== placeName) {
          placeName += `, ${address.city}`;
        } else if (address.town && address.town !== placeName) {
          placeName += `, ${address.town}`;
        }
        
        setPlaceName(placeName);
      } else {
        setPlaceName('Location details not available');
      }
    } catch (error) {
      console.error('Error fetching place name:', error);
      // setPlaceName('Unable to load location details');
    } finally {
      setIsLoadingPlace(false);
    }
  };

  const getData = async () => {
    const res = await GET(`get_appointment/${id}`);
    return res.data;
  };
  
  const { isLoading, data, error } = useQuery({
    queryKey: ["appoinment", id],
    queryFn: getData,
  });

  const event = {
    title: `Appointment with ${data?.doct_f_name} ${data?.doct_l_name}`,
    start: `${data?.date}T${data?.time_slots}`,
    description: `Department: ${data?.dept_title}\nType: ${data?.type}`,
    location: "Your Clinic Location",
  };

  const googleCalendarUrl = createGoogleCalendarUrl(event);
  const QrData = {
    appointment_id: id,
    date: data?.date,
    time: data?.time_slots,
  };

  const appointmentData = {
    qrValue: JSON.stringify(QrData),
  };

  // Extract location data for Out Call appointments only
  const locationData = data?.type === "Out Call" && data?.out_call_address 
    ? extractLocationData(data.out_call_address) 
    : null;

  // Fetch place name when location data is available
  useEffect(() => {
    if (locationData) {
      getPlaceName(locationData.latitude, locationData.longitude);
    }
  }, [locationData]);

  if (isLoading) return <Loading />;
  if (error) return <ErrorPage />;

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.md" centerContent>
        <Box
          p={8}
          shadow="xl"
          borderWidth="1px"
          borderRadius="2xl"
          w="100%"
          bg="white"
          mb={8}
          borderColor="gray.100"
        >
          <VStack spacing={6} align="center">
            {/* Success Icon */}
            <Box textAlign="center">
              <Image
                boxSize="80px"
                objectFit="contain"
                src="/confirm.png"
                alt="Success"
                mx="auto"
              />
            </Box>

            {/* Appointment ID */}
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              Appointment ID: #{data.id}
            </Text>
            
            {/* Appointment Type Badge */}
            <Badge
              px={4}
              py={2}
              fontWeight="bold"
              colorScheme={getTypeConfig(data.type).badgeColor}
              fontSize="sm"
              borderRadius="full"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {getTypeConfig(data.type).displayName}
            </Badge>

            {/* Main Success Message */}
            <Heading
              size="lg"
              color="primary.bg"
              textAlign="center"
              lineHeight="1.2"
              fontWeight="bold"
            >
              Your Appointment Booked Successfully!
            </Heading>

            {/* Dynamic Type Message */}
            <Text
              color="gray.600"
              textAlign="center"
              fontSize="lg"
              maxW="600px"
              lineHeight="1.6"
              fontWeight="500"
            >
              {getTypeConfig(data.type).message}
            </Text>

            {/* QR Code and Meeting Sections */}
            <VStack spacing={6} w="100%" maxW="400px">
              {/* OPD QR Code */}
              {data?.type === "OPD" && (
                <QRCodeComponent data={appointmentData} />
              )}

              {/* Video Consultant - Meeting QR and Button */}
              {data?.type === "Video Consultant" && (
                <VStack spacing={4} w="100%">
                  {data?.meeting_link && <MeetingQR data={data?.meeting_link} />}
                  {data?.meeting_link && (
                    <Button
                      colorScheme="blue"
                      size="lg"
                      w="100%"
                      maxW="300px"
                      onClick={() => window.open(data?.meeting_link, "_blank")}
                      shadow="md"
                    >
                      Join Meeting
                    </Button>
                  )}
                </VStack>
              )}
            </VStack>

            {/* SIMPLIFIED: Out Call Address Details */}
            {data.type === "Out Call" && data.out_call_address && (
              <Box w="100%" maxW="600px" mt={2}>
                <Card 
                  variant="outline" 
                  borderColor="blue.200"
                  shadow="md"
                  borderRadius="xl"
                  bg="white"
                >
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      {/* Header */}
                      <Flex align="center" justify="center" mb={2}>
                        <Box color="purple.500" fontSize="2xl" mr={2}>
                          <FaHome />
                        </Box>
                        <Text fontWeight="bold" fontSize="xl" color="blue.700">
                          Location Details
                        </Text>
                      </Flex>
                      
                      {/* Copy Button */}
                      <Flex justify="flex-end">
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          leftIcon={<FaCopy />}
                          onClick={() => {
                            navigator.clipboard.writeText(data.out_call_address);
                            toast({
                              title: "Location copied!",
                              description: "Location details copied to clipboard",
                              status: "success",
                              duration: 2000,
                              isClosable: true,
                              position: "top",
                            });
                          }}
                        >
                          Copy
                        </Button>
                      </Flex>

                      {/* Place Name */}
                      {placeName && (
                        <Box mb={3} pb={3} borderBottom="1px solid" borderColor="gray.200">
                          <Flex align="center">
                            <Box color="green.500" mr={2}>
                              <FaMapMarkerAlt />
                            </Box>
                            <Text fontSize="lg" fontWeight="bold" color="green.700">
                              {placeName}
                            </Text>
                          </Flex>
                        </Box>
                      )}

                      {/* Clean Address Display */}
                      <Box mb={4}>
                        <Text 
                          fontSize="sm" 
                          color="gray.700" 
                          lineHeight="1.6"
                          bg="gray.50"
                          p={3}
                          borderRadius="md"
                        >
                          {data.out_call_address.split('\n').filter(line => 
                            !line.includes('Latitude:') && 
                            !line.includes('Longitude:') &&
                            !line.includes('🗺️ Open Location:') &&
                            !line.includes('🚗 Get Directions:')
                          ).join('\n')}
                        </Text>
                      </Box>

                      {/* Location Information Grid */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                        {data.out_call_city && (
                          <Box>
                            <Text fontSize="sm" fontWeight="600" color="gray.600" mb={1}>
                              🏙️ City
                            </Text>
                            <Text fontSize="md" fontWeight="medium" color="gray.800">
                              {data.out_call_city}
                            </Text>
                          </Box>
                        )}
                        
                        {data.out_call_landmark && (
                          <Box>
                            <Text fontSize="sm" fontWeight="600" color="gray.600" mb={1}>
                              📍 Landmark
                            </Text>
                            <Text fontSize="md" fontWeight="medium" color="gray.800">
                              {data.out_call_landmark}
                            </Text>
                          </Box>
                        )}
                      </SimpleGrid>

                      {/* Special Instructions */}
                      {data.out_call_instructions && (
                        <Box mb={4} p={3} bg="orange.50" borderRadius="md">
                          <Text fontSize="sm" fontWeight="600" color="orange.700" mb={1}>
                            💡 Special Instructions
                          </Text>
                          <Text fontSize="sm" color="orange.800">
                            {data.out_call_instructions}
                          </Text>
                        </Box>
                      )}

                      {/* Map Action Buttons */}
                      {locationData && (
                        <Flex gap={3} justify="center">
                          <Button
                            leftIcon={<FaExternalLinkAlt />}
                            colorScheme="blue"
                            size="md"
                            onClick={() => window.open(locationData.mapsUrl, "_blank")}
                            flex="1"
                          >
                            View in Maps
                          </Button>
                          <Button
                            leftIcon={<FaDirections />}
                            colorScheme="green"
                            variant="solid"
                            size="md"
                            onClick={() => window.open(locationData.directionsUrl, "_blank")}
                            flex="1"
                          >
                            Get Directions
                          </Button>
                        </Flex>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </Box>
            )}

            {/* Appointment Details */}
            <Box w="100%" maxW="600px">
              <Card bg="white" shadow="md" borderRadius="xl">
                <CardBody p={6}>
                  <Flex
                    justify="space-between"
                    wrap="wrap"
                    gap={6}
                  >
                    <Box textAlign="center" flex="1" minW="150px">
                      <Text fontWeight="bold" color="blue.600" mb={2} fontSize="sm">
                        👨‍⚕️ Doctor
                      </Text>
                      <Text fontSize="md" fontWeight="semibold" color="gray.800">
                        {data.doct_f_name} {data.doct_l_name}
                      </Text>
                    </Box>
                    <Box textAlign="center" flex="1" minW="150px">
                      <Text fontWeight="bold" color="blue.600" mb={2} fontSize="sm">
                        📅 Date & Time
                      </Text>
                      <Text fontSize="md" fontWeight="semibold" color="gray.800">
                        {new Date(data.date).toLocaleDateString()} {data.time_slots}
                      </Text>
                    </Box>
                    <Box textAlign="center" flex="1" minW="150px">
                      <Text fontWeight="bold" color="blue.600" mb={2} fontSize="sm">
                        👤 Patient Name
                      </Text>
                      <Text fontSize="md" fontWeight="semibold" color="gray.800">
                        {data.patient_f_name} {data.patient_l_name}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>
            </Box>

            <Divider />

            {/* Calendar Buttons */}
            <Flex gap={4} wrap="wrap" justify="center">
              <Button
                colorScheme="blue"
                variant="solid"
                onClick={() => window.open(googleCalendarUrl, "_blank")}
                leftIcon={<Image src="/google.png" w={5} />}
                size="md"
                shadow="md"
              >
                Add to Google Calendar
              </Button>
              <Button
                colorScheme="gray"
                variant="solid"
                onClick={() => handleDownloadICalendar(event)}
                leftIcon={<Image src="/appleLogo.png" w={5} />}
                size="md"
                shadow="md"
              >
                Add to Apple Calendar
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default AppointmentSuccess;
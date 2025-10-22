// src/Components/LocationShare.jsx
import {
  Box,
  Button,
  VStack,
  Text,
  Textarea,
  Flex,
  useToast,
  Spinner,
  Card,
  CardBody,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaLocationArrow, FaMapMarkerAlt, FaCopy, FaExternalLinkAlt } from "react-icons/fa";

const LocationShare = ({ value, onChange, isDisabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Get REAL current location using browser GPS
  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services",
        status: "error",
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    // This uses device GPS - shows EXACT location like WhatsApp
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ latitude, longitude });
        
        // Create Google Maps links
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        
        const locationText = `📍 My Current Location\nLatitude: ${latitude}\nLongitude: ${longitude}\n\n🗺️ Open Location: ${mapsUrl}\n🚗 Get Directions: ${mapsDirectionsUrl}`;
        
        onChange(locationText);
        setIsLoading(false);
        onOpen(); // Show confirmation modal
        
        toast({
          title: "Location shared successfully!",
          description: "Your exact GPS location has been shared",
          status: "success",
          duration: 3000,
        });
      },
      (error) => {
        setIsLoading(false);
        let errorMessage = "Failed to get location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "📍 Location access denied. Please enable location permissions in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please check your GPS signal.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "An unknown error occurred while getting location.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          status: "error",
          duration: 5000,
        });
      },
      {
        enableHighAccuracy: true, // Uses GPS for precise location
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  // Generate static map preview (optional enhancement)
  const getStaticMapUrl = (lat, lng) => {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&markers=color:red%7C${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`;
  };

  // Copy location to clipboard
  const copyToClipboard = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      toast({
        title: "Copied to clipboard!",
        status: "success",
        duration: 2000,
      });
    }
  };

  // Extract coordinates from location text
  const extractCoordinates = (text) => {
    const urlMatch = text.match(/https:\/\/www\.google\.com\/maps\?q=([-\d.]+),([-\d.]+)/);
    if (urlMatch) {
      return { 
        latitude: parseFloat(urlMatch[1]), 
        longitude: parseFloat(urlMatch[2]),
        mapsUrl: urlMatch[0]
      };
    }
    
    // Fallback: extract from text
    const latMatch = text.match(/Latitude:\s*([-\d.]+)/);
    const lngMatch = text.match(/Longitude:\s*([-\d.]+)/);
    if (latMatch && lngMatch) {
      return { 
        latitude: parseFloat(latMatch[1]), 
        longitude: parseFloat(lngMatch[1]),
        mapsUrl: `https://www.google.com/maps?q=${latMatch[1]},${lngMatch[1]}`
      };
    }
    
    return null;
  };

  const coordinates = value ? extractCoordinates(value) : null;

  return (
    <VStack spacing={4} w="100%" align="stretch">
      {/* Location Sharing Options */}
      <Card variant="outline" borderColor="blue.200">
        <CardBody>
          <VStack spacing={4}>
            <Flex align="center" gap={2}>
              <Box color="blue.500" fontSize="xl">
                <FaMapMarkerAlt />
              </Box>
              <Text fontWeight="bold" fontSize="lg" color="blue.700">
                Share Your Exact Location
              </Text>
            </Flex>
            
            {/* Share Current Location Button */}
            <Button
              leftIcon={isLoading ? <Spinner size="sm" /> : <FaLocationArrow />}
              colorScheme="blue"
              onClick={getCurrentLocation}
              isLoading={isLoading}
              loadingText="Getting Your Location..."
              w="100%"
              size="lg"
              isDisabled={isDisabled}
            >
              {isLoading ? "Detecting Location..." : "Share Current Location"}
            </Button>
            
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Uses your device's GPS to share exact coordinates with the doctor
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Manual Address Input */}
      <Box>
        <Text fontWeight="medium" mb={2}>
          Or Enter Address Manually:
        </Text>
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your complete address with landmarks...
Example:
House #123, Street 45, Sector G-10
Near Central Park, Opposite McDonald's
Islamabad, Pakistan

Or share your live location using the button above for exact GPS coordinates."
          rows={4}
          isDisabled={isLoading || isDisabled}
        />
      </Box>

      {/* Preview Shared Location */}
      {value && coordinates && (
        <Card bg="green.50" borderColor="green.200">
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Flex justify="space-between" align="center">
                <Badge colorScheme="green" fontSize="sm">
                  ✅ Location Shared
                </Badge>
                <Flex gap={2}>
                  <IconButton
                    icon={<FaCopy />}
                    size="sm"
                    onClick={copyToClipboard}
                    aria-label="Copy location"
                  />
                </Flex>
              </Flex>
              
              <Box bg="white" p={3} borderRadius="md">
                <Text whiteSpace="pre-wrap" fontSize="sm" fontFamily="monospace">
                  {value}
                </Text>
              </Box>
              
              <VStack spacing={2} align="stretch">
                <Button
                  leftIcon={<FaExternalLinkAlt />}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => window.open(coordinates.mapsUrl, "_blank")}
                >
                  View in Google Maps
                </Button>
                
                <Button
                  leftIcon={<FaLocationArrow />}
                  colorScheme="green"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`,
                    "_blank"
                  )}
                >
                  Get Directions
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Location Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>📍 Location Shared Successfully!</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text>
                Your exact GPS location has been shared with the doctor. They can now:
              </Text>
              
              <Box bg="blue.50" p={3} borderRadius="md">
                <Text fontWeight="bold">📍 See your exact location</Text>
                <Text fontSize="sm">Latitude: {currentCoords?.latitude}</Text>
                <Text fontSize="sm">Longitude: {currentCoords?.longitude}</Text>
              </Box>
              
              <Text fontSize="sm" color="gray.600">
                The doctor can click the Google Maps link to get exact directions to your location.
              </Text>
              
              <Button colorScheme="blue" onClick={onClose}>
                Got it!
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default LocationShare;
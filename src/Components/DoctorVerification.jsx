import { Box, Text, Image, VStack, Flex, Alert, AlertIcon } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../Controllers/ApiControllers";
import Loading from "../Components/Loading";

export default function DoctorVerification() {
  const { token } = useParams();

  const verifyDoctor = async () => {
    const res = await GET(`verify-doctor/${token}`);
    return res;
  };

  const { isLoading, data } = useQuery({
    queryKey: ["verifyDoctor", token],
    queryFn: verifyDoctor,
  });

  if (isLoading) return <Loading />;

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Box maxW="md" mx="auto" bg="white" p={6} borderRadius="lg" shadow="md">
        <VStack spacing={4}>
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            Doctor Verified Successfully
          </Alert>

          {data?.doctor && (
            <>
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                {data.doctor.name}
              </Text>
              
              <Flex direction="column" gap={2} w="100%">
                <Text><strong>Department:</strong> {data.doctor.department}</Text>
                <Text><strong>Specialization:</strong> {data.doctor.specialization}</Text>
                <Text><strong>Experience:</strong> {data.doctor.experience}</Text>
              </Flex>

              {data.doctor.certificate && (
                <Box mt={4}>
                  <Text fontWeight="bold" mb={2}>Doctor Certificate:</Text>
                  <Image 
                    src={data.doctor.certificate} 
                    alt="Doctor Certificate"
                    maxW="100%"
                    borderRadius="md"
                  />
                </Box>
              )}

              <Box mt={4} p={3} bg="green.50" borderRadius="md" w="100%">
                <Text fontSize="sm" color="green.800" textAlign="center">
                  ✓ This doctor is verified and authentic
                </Text>
              </Box>
            </>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
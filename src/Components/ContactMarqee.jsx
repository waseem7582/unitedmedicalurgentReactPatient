import { ImLocation } from "react-icons/im";
import { FiMail } from "react-icons/fi";
import { Box, Button, Flex, HStack, Link, Text } from "@chakra-ui/react";
import Marquee from "react-fast-marquee";
import useSettingsData from "../Hooks/SettingData";
import { FaAmbulance } from "react-icons/fa";
import { PhoneIcon } from "@chakra-ui/icons";
function ContactMarqee() {
  const { settingsData } = useSettingsData();
  const ambulence_Btn = settingsData?.find(
    (value) => value.id_name === "ambulance_btn_enable"
  );
  const phone1 = settingsData?.find((value) => value.id_name === "phone");
  const phone2 = settingsData?.find(
    (value) => value.id_name === "phone_second"
  );
  const email = settingsData?.find((value) => value.id_name === "email");
  const address = settingsData?.find((value) => value.id_name === "address");
  const ambulence_num = settingsData?.find(
    (value) => value.id_name === "ambulance_number"
  );
  const latitude = settingsData?.find(
    (value) => value.id_name === "clinic_location_latitude"
  );
  const longitude = settingsData?.find(
    (value) => value.id_name === "clinic_location_longitude"
  );

  return (
    <>
      {settingsData ? (
        <Box
          py={2}
          bg={"blue.900"}
          color={"#fff"}
          borderBottom={"0.5px solid"}
          borderColor={"gray.400"}
          px={2}
        >
          {" "}
          <Flex gap={2} align={"center"} justifyContent={"space-between"}>
            <Box display={{ sm: "block", lg: "none" }} maxW={"60%"}>
              {" "}
              <Marquee pauseOnHover speed={40}>
                {" "}
                <Flex gap={7} minW={"100vw"} mr={5}>
                  {" "}
                  <a
                    href={`tel:${phone1.value}`}
                    display="flex"
                    color="blue.500"
                    fontWeight="bold"
                  >
                    <HStack spacing={1}>
                      <PhoneIcon boxSize={3} />
                      <Text fontSize="sm">{phone1.value}</Text>
                    </HStack>
                  </a>
                  <a
                    href={`tel:${phone2.value}`}
                    display="flex"
                    color="blue.500"
                    fontWeight="bold"
                  >
                    <HStack spacing={2}>
                      <PhoneIcon boxSize={3} />
                      <Text fontSize="sm">{phone1.value}</Text>
                    </HStack>
                  </a>
                  <a
                    href={`mailto:${email.value}`}
                    display="flex"
                    color="blue.500"
                    fontWeight="bold"
                  >
                    <HStack spacing={2}>
                      <FiMail />
                      <Text fontSize="sm">{email.value}</Text>
                    </HStack>
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${address.value}`}
                    display="flex"
                    color="blue.500"
                    fontWeight="bold"
                  >
                    <HStack spacing={2}>
                      <ImLocation />
                      <Text fontSize="sm">Address: {address.value}</Text>
                    </HStack>
                  </a>
                </Flex>
              </Marquee>
            </Box>{" "}
            <Box display={{ base: "none", lg: "block" }} w={"100%"}>
              <div className="container">
                {" "}
                <Flex gap={7} justifyContent={"flex-end"}>
                  {" "}
                  <a
                    href={`tel:${phone1.value}`}
                    display="flex"
                    color="blue.500"
                    fontWeight="bold"
                  >
                    <HStack spacing={1}>
                      <PhoneIcon boxSize={3} />
                      <Text fontSize="sm">{phone1.value}</Text>
                    </HStack>
                  </a>
                  <a
                    href={`tel:${phone2.value}`}
                    display="flex"
                    color="blue.500"
                    fontWeight="bold"
                  >
                    <HStack spacing={2}>
                      <PhoneIcon boxSize={3} />
                      <Text fontSize="sm">{phone1.value}</Text>
                    </HStack>
                  </a>
                  <a
                    href={`mailto:${email.value}`}
                    display="flex"
                    color="blue.500"
                    fontWeight="bold"
                  >
                    <HStack spacing={2}>
                      <FiMail />
                      <Text fontSize="sm">{email.value}</Text>
                    </HStack>
                  </a>
                  <Link
                    href={`https://www.google.com/maps?q=${latitude.value},${longitude.value}`}
                    display="flex"
                    color="#fff"
                    fontWeight="semi-bold"
                    isExternal
                    textTransform={"none"}
                  >
                    <HStack spacing={2}>
                      <ImLocation />
                      <Text fontSize="sm">Address: {address.value}</Text>
                    </HStack>
                  </Link>
                </Flex>
              </div>{" "}
            </Box>
            {ambulence_Btn.value === "true" && (
              <Button
                size={{ base: "xs", md: "sm" }}
                colorScheme={"red"}
                rightIcon={<FaAmbulance fontSize={20} />}
                w={"180px"}
                as={"a"}
                href={`tel:${ambulence_num.value}`}
              >
                Call Ambulance
              </Button>
            )}
          </Flex>
        </Box>
      ) : null}
    </>
  );
}

export default ContactMarqee;

import { AiOutlineArrowLeft } from "react-icons/ai";
import { AiOutlineArrowRight } from "react-icons/ai";
/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery } from "@tanstack/react-query";
import { GET } from "../Controllers/ApiControllers";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import imageBaseURL from "./../Controllers/image";
import "swiper/css";
import Slider from "react-slick";
import { Link } from "react-router-dom";

export default function Doctors() {
  const getData = async () => {
    const res = await GET("get_active_doctor");
    return res.data;
  };
  const { isLoading, data, error } = useQuery({
    queryKey: ["doctors"],
    queryFn: getData,
  });

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <AiOutlineArrowRight fontSize={10} color="#fff" />,
    prevArrow: <AiOutlineArrowLeft fontSize={10} color="#fff" />,
    responsive: [
      {
        breakpoint: 1024, // For large screens
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 857, // For large screens
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 600, // For tablets
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480, // For mobile devices
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Box mt={5} className="container">
      {data ? (
        <>
          <Heading color={"primary.text"} fontWeight={600} textAlign={"center"}>
            Best Doctors in California
          </Heading>
          <Text
            fontSize={14}
            textAlign={"center"}
            mt={2}
            color={"gray.500"}
            fontWeight={500}
          >
            Our team of skilled doctors covers a broad spectrum of specialties, delivering personalized treatment and expert care designed around your unique health needs.
          </Text>
          <Box mt={4} maxW={"100vw"} overflow={"hidden"}>
            <Slider {...settings}>
              {data.map((item) => (
                <Box key={item.id} borderRadius={10} cursor={"pointer"}>
                  <Flex
                    flexDir={"column"}
                    align={"center"}
                    cursor={"pointer"}
                    padding={5}
                    justify={"center"}
                  >
                    <Box
                      overflow={"hidden"}
                      h={{ base: "300px", md: "250px" }}
                      w={{ base: "300px", md: "250px" }}
                      borderRadius={item.image ? "10%" : "10%"}
                    >
                      {" "}
                      <Image
                        src={
                          item.image
                            ? `${imageBaseURL}/${item.image}`
                            : "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D"
                        }
                        w={{ base: "300px", md: "250px" }}
                      />
                    </Box>
                    <Text
                      mt={2}
                      fontSize={{ base: "18px", md: "20px", lg: "20px" }}
                      fontWeight={600}
                      as={Link}
                      to={`/doctor/${item.user_id}`}
                    >
                      {item.f_name} {item.l_name}
                    </Text>
                    <Text
                      color={"primary.text"}
                      mt={1}
                      fontSize={{ base: "14px", md: "15px", lg: "16px" }}
                      fontWeight={700}
                    >
                      {item.department_name}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </Slider>

            <Flex justify={"center"} mt={5}>
              <Button
                fontWeight={600}
                size={"sm"}
                colorScheme="blue"
                w={300}
                as={Link}
                to={"/doctors"}
              >
                See all {">>"}
              </Button>
            </Flex>
          </Box>
        </>
      ) : null}
      {isLoading ? (
        <>
          {" "}
          <Skeleton h={"100px"} w={"100%"} mt={5} />
        </>
      ) : null}
      {error ? (
        <>
          {" "}
          <Text
            fontSize={{ base: 12, md: 14 }}
            fontWeight={400}
            color={"red"}
            textAlign={"center"}
          >
            Something Went wrong!
          </Text>
          <Text
            fontSize={{ base: 12, md: 14 }}
            fontWeight={400}
            color={"red"}
            textAlign={"center"}
          >
            Can&apos;t Fetch Doctors!
          </Text>
        </>
      ) : null}
    </Box>
  );
}

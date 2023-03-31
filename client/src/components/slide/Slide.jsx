import React from "react";
import "./Slide.scss";
import LeftArrow from "../../assets/left-arrow.svg";
import RightArrow from "../../assets/right-arrow.svg";
// import "./Temp.scss";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slide = ({ data, children }) => {
  const SlickArrowLeft = ({ currentSlide, slideCount, ...props }) => (
    <img src={LeftArrow} alt="prevArrow" {...props} />
  );

  const SlickArrowRight = ({ currentSlide, slideCount, ...props }) => (
    <img src={RightArrow} alt="nextArrow" {...props} />
  );
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    prevArrow: <SlickArrowLeft />,
    nextArrow: <SlickArrowRight />,
  };
  return (
    <div className="slide">
      <div className="container">
        <Slider {...settings}>
          {/* {data.map((item, index) => {
          return (
            // <Link to="/gigs?cat=design">

            <div className="catCard" key={index}>
              <img src={item.img} alt="" />
              <span className="desc">{item.desc}</span>
              <span className="title">{item.title}</span>
            </div>
            // </Link>
          );
        })} */}
          {children}
        </Slider>
      </div>
    </div>
  );
};

export default Slide;

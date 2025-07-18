import React,{ useState } from "react";
import PropTypes from 'prop-types';
import { RiArrowRightDownLine  } from "react-icons/ri";

const Services = ({ sections }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Services Mega Dropdown */}
      <div 
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button className="hover:text-black flex items-center bg-transparent focus:outline-none border-none">
          Services<span><RiArrowRightDownLine /></span> 
        </button>

        {/* Mega Dropdown Menu */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 top-full w-[90vw] max-w-6xl bg-[#fbfcfc] text-black shadow-lg transition-all duration-400 ease-in-out ${isOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-5 opacity-0 invisible"} z-50 p-6 rounded-lg`}>
          <div className="grid grid-cols-3 gap-6 text-center">

            {sections.map((section, index) => (
              <div key={index}>
                <h3 className="font-bold text-lg mb-2">{section.title}</h3>
                <ul>
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex flex-col items-left space-y-2 p-2 rounded">
                      <img src={item.icon} alt={item.label} className="w-10 h-10 rounded"/>
                      <a href={item.link}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>
        </div>
      </div>
    </>
  );
};

Services.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          icon: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          link: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};

export default Services;
import { format } from "date-fns";
import PropTypes from "prop-types";

const ConfirmationDetailsCard = ({ data }) => {
  const formatArray = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "N/A";
    return arr.join(", ");
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Candidate Information */}
      <div className="mb-2">
        <h4 className="font-semibold text-primary-text">
          Candidate Information
        </h4>
      </div>

      <p className="text-primary-text">
        Full Name:{" "}
        <span className="font-medium">{data?.full_name || "N/A"}</span>
      </p>

      <p className="text-primary-text">
        Preferred Name:{" "}
        <span className="font-medium">{data?.preferred_name || "N/A"}</span>
      </p>

      <p className="text-primary-text">
        Address: <span className="font-medium">{data?.address || "N/A"}</span>
      </p>

      <p className="text-primary-text">
        Date of Birth:{" "}
        <span className="font-medium">
          {format(new Date(data?.date_of_birth), "MMMM dd, yyyy")}
        </span>
      </p>

      {/* Mass & Baptism Information */}
      <div className="mb-2 mt-4">
        <h4 className="font-semibold text-primary-text">
          Mass & Baptism Details
        </h4>
      </div>

      <p className="text-primary-text">
        Mass Location:{" "}
        <span className="font-medium">{data?.mass_location || "N/A"}</span>
      </p>

      {data?.mass_location === "Other" && data?.mass_location_other && (
        <p className="text-primary-text">
          Other Mass Location:{" "}
          <span className="font-medium">{data.mass_location_other}</span>
        </p>
      )}

      <p className="text-primary-text">
        Date of Baptism:{" "}
        <span className="font-medium">
          {format(new Date(data?.baptism_date), "MMMM dd, yyyy")}
        </span>
      </p>

      <p className="text-primary-text">
        Place/Church of Baptism:{" "}
        <span className="font-medium">{data?.baptism_place || "N/A"}</span>
      </p>

      <p className="text-primary-text">
        Postal Address of Church:{" "}
        <span className="font-medium">
          {data?.baptism_church_address || "N/A"}
        </span>
      </p>

      {/* Medical & Additional Needs */}
      <div className="mb-2 mt-4">
        <h4 className="font-semibold text-primary-text">
          Medical & Additional Information
        </h4>
      </div>

      <p className="text-primary-text">
        Medical Conditions:{" "}
        <span className="font-medium">{data?.medical_conditions || "N/A"}</span>
      </p>

      <p className="text-primary-text">
        Additional Needs:{" "}
        <span className="font-medium">{data?.additional_needs || "N/A"}</span>
      </p>

      {/* Contact Information */}
      <div className="mb-2 mt-4">
        <h4 className="font-semibold text-primary-text">Contact Details</h4>
      </div>

      <p className="text-primary-text">
        Main Contact Name:{" "}
        <span className="font-medium">{data?.main_contact_name || "N/A"}</span>
      </p>

      <p className="text-primary-text">
        Relationship to Candidate:{" "}
        <span className="font-medium">
          {data?.candidate_relationship || "N/A"}
        </span>
      </p>

      {data?.candidate_relationship === "Other" &&
        data?.candidate_relationship_other && (
          <p className="text-primary-text">
            Other Relationship:{" "}
            <span className="font-medium">
              {data.candidate_relationship_other}
            </span>
          </p>
        )}

      <p className="text-primary-text">
        Email: <span className="font-medium">{data?.email || "N/A"}</span>
      </p>

      <p className="text-primary-text">
        Mobile Number:{" "}
        <span className="font-medium">{data?.mobile_number || "N/A"}</span>
      </p>

      {/* Sponsor Information */}
      <div className="mb-2 mt-4">
        <h4 className="font-semibold text-primary-text">Sponsor Information</h4>
      </div>

      <p className="text-primary-text">
        Sponsor Name:{" "}
        <span className="font-medium">{data?.sponsor_name || "N/A"}</span>
      </p>

      <p className="text-primary-text">
        Sponsor&apos;s Email:{" "}
        <span className="font-medium">{data?.sponsor_email || "N/A"}</span>
      </p>

      <p className="text-primary-text">
        Sponsor Baptised & Confirmed:{" "}
        <span className="font-medium">{data?.sponsor_baptised || "N/A"}</span>
      </p>

      {/* Permissions */}
      <div className="mb-2 mt-4">
        <h4 className="font-semibold text-primary-text">
          Contact Preferences & Permissions
        </h4>
      </div>

      <p className="text-primary-text">
        Preferred Contact Method:{" "}
        <span className="font-medium">
          {formatArray(data?.preferred_contact)}
        </span>
      </p>

      <p className="text-primary-text">
        Permission Types:{" "}
        <span className="font-medium">
          {formatArray(data?.permission_types)}
        </span>
      </p>
    </div>
  );
};

ConfirmationDetailsCard.propTypes = {
  data: PropTypes.shape({
    full_name: PropTypes.string,
    preferred_name: PropTypes.string,
    address: PropTypes.string,
    date_of_birth: PropTypes.string,
    mass_location: PropTypes.string,
    mass_location_other: PropTypes.string,
    baptism_date: PropTypes.string,
    baptism_place: PropTypes.string,
    baptism_church_address: PropTypes.string,
    medical_conditions: PropTypes.string,
    additional_needs: PropTypes.string,
    main_contact_name: PropTypes.string,
    candidate_relationship: PropTypes.string,
    candidate_relationship_other: PropTypes.string,
    email: PropTypes.string,
    mobile_number: PropTypes.string,
    sponsor_name: PropTypes.string,
    sponsor_email: PropTypes.string,
    sponsor_baptised: PropTypes.string,
    preferred_contact: PropTypes.arrayOf(PropTypes.string),
    permission_types: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default ConfirmationDetailsCard;

package com.org.vilora.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    @NotBlank(message = "Full name is required")
    @JsonProperty("fullName")
    @JsonAlias({"name"})
    private String fullName;

    @JsonProperty("street")
    @JsonAlias({"addressLine1", "address1", "streetAddress"})
    private String street;

    @JsonProperty("addressLine2")
    @JsonAlias({"address2"})
    private String addressLine2;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @JsonProperty("zipCode")
    @JsonAlias({"pincode", "postalCode", "zip"})
    private String zipCode;

    @JsonProperty("phone")
    @JsonAlias({"phoneNumber", "mobile"})
    private String phone;

    private Boolean isDefault;

    public String getStreet() {
        return street != null ? street : "";
    }

    public String getZipCode() {
        return zipCode != null ? zipCode : "";
    }

    public String getPhone() {
        return phone != null ? phone : "";
    }
}

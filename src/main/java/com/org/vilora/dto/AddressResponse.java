package com.org.vilora.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {

    private UUID id;
    private String fullName;
    private String street;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String phone;
    private Boolean isDefault;

    @JsonProperty("name")
    public String getName() {
        return fullName;
    }

    @JsonProperty("addressLine1")
    public String getAddressLine1() {
        return street;
    }

    @JsonProperty("pincode")
    public String getPincode() {
        return zipCode;
    }

    @JsonProperty("phoneNumber")
    public String getPhoneNumber() {
        return phone;
    }
}

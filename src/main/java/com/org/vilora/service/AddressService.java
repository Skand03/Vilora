package com.org.vilora.service;

import com.org.vilora.dto.AddressRequest;
import com.org.vilora.dto.AddressResponse;

import java.util.List;
import java.util.UUID;

public interface AddressService {

    AddressResponse addAddress(UUID userId, AddressRequest request);

    List<AddressResponse> getAddresses(UUID userId);

    AddressResponse getAddressById(UUID userId, UUID addressId);

    AddressResponse updateAddress(UUID userId, UUID addressId, AddressRequest request);

    void deleteAddress(UUID userId, UUID addressId);

    AddressResponse setDefaultAddress(UUID userId, UUID addressId);
}

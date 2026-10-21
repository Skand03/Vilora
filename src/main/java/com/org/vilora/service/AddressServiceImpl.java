package com.org.vilora.service;

import com.org.vilora.dto.AddressRequest;
import com.org.vilora.dto.AddressResponse;
import com.org.vilora.entity.Address;
import com.org.vilora.entity.User;
import com.org.vilora.exception.ResourceNotFoundException;
import com.org.vilora.repository.AddressRepository;
import com.org.vilora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    public AddressResponse addAddress(UUID userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Address> existingAddresses = addressRepository.findByUserId(userId);
        boolean isFirstAddress = existingAddresses.isEmpty();
        boolean shouldBeDefault = isFirstAddress || Boolean.TRUE.equals(request.getIsDefault());

        if (shouldBeDefault && !isFirstAddress) {
            existingAddresses.forEach(addr -> {
                if (Boolean.TRUE.equals(addr.getIsDefault())) {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                }
            });
        }

        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName())
                .street(request.getStreet())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .phone(request.getPhone())
                .isDefault(shouldBeDefault)
                .build();

        return mapToResponse(addressRepository.save(address));
    }

    @Override
    public List<AddressResponse> getAddresses(UUID userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AddressResponse getAddressById(UUID userId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to address");
        }

        return mapToResponse(address);
    }

    @Override
    public AddressResponse updateAddress(UUID userId, UUID addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to address");
        }

        address.setFullName(request.getFullName());
        address.setStreet(request.getStreet());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());
        address.setPhone(request.getPhone());

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            List<Address> userAddresses = addressRepository.findByUserId(userId);
            userAddresses.forEach(addr -> {
                if (!addr.getId().equals(addressId) && Boolean.TRUE.equals(addr.getIsDefault())) {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                }
            });
            address.setIsDefault(true);
        }

        return mapToResponse(addressRepository.save(address));
    }

    @Override
    public void deleteAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to address");
        }

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserId(userId);
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    @Override
    public AddressResponse setDefaultAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to address");
        }

        List<Address> userAddresses = addressRepository.findByUserId(userId);
        userAddresses.forEach(addr -> {
            addr.setIsDefault(addr.getId().equals(addressId));
            addressRepository.save(addr);
        });

        return mapToResponse(address);
    }

    private AddressResponse mapToResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .street(address.getStreet())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .zipCode(address.getZipCode())
                .phone(address.getPhone())
                .isDefault(address.getIsDefault())
                .build();
    }
}

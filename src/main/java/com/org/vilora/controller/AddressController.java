package com.org.vilora.controller;

import com.org.vilora.dto.AddressRequest;
import com.org.vilora.dto.AddressResponse;
import com.org.vilora.dtoHelper.ApiResponse;
import com.org.vilora.service.AddressService;
import com.org.vilora.service.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody AddressRequest request) {

        AddressResponse response = addressService.addAddress(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address added successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<AddressResponse> responses = addressService.getAddresses(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Addresses fetched successfully", responses));
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddressById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID addressId) {

        AddressResponse response = addressService.getAddressById(userDetails.getId(), addressId);
        return ResponseEntity.ok(ApiResponse.success("Address fetched successfully", response));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID addressId,
            @Valid @RequestBody AddressRequest request) {

        AddressResponse response = addressService.updateAddress(userDetails.getId(), addressId, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", response));
    }

    @PatchMapping("/{addressId}/default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID addressId) {

        AddressResponse response = addressService.setDefaultAddress(userDetails.getId(), addressId);
        return ResponseEntity.ok(ApiResponse.success("Default address updated successfully", response));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID addressId) {

        addressService.deleteAddress(userDetails.getId(), addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully"));
    }
}

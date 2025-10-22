/**
 * Promo Code Service Tests
 * Basic tests to verify the promo code service functionality
 */

import promoCodeService from '../promoCodeService';

// Mock axios instance
jest.mock('../axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}));

import axiosInstance from '../axios';

describe('PromoCodeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPromoCodes', () => {
    it('should fetch promo codes with correct parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'promo_ABC123',
              code: 'NEWCOUPON123',
              coupon: 'NW9R8Nvi',
              active: true,
              expires_at: 1735689600,
              max_redemptions: 10
            }
          ],
          message: 'Successfully listed promotion codes',
          status: 200
        }
      };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const params = {
        active: true,
        code: 'NEWCOUPON123',
        coupon: 'NW9R8Nvi'
      };

      const result = await promoCodeService.getPromoCodes(params);

      expect(axiosInstance.get).toHaveBeenCalledWith('/promotion_code/', { params });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createPromoCode', () => {
    it('should create a new promo code with correct payload', async () => {
      const mockResponse = {
        data: {
          message: 'Successfully created coupon',
          status: 201
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const promoCodeData = {
        active: true,
        code: 'NEWCOUPON123',
        coupon: 'NW9R8Nvi',
        expires_at: 1735689600,
        max_redemptions: 10
      };

      const result = await promoCodeService.createPromoCode(promoCodeData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/promotion_code', promoCodeData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('togglePromoCodeStatus', () => {
    it('should toggle promo code status correctly', async () => {
      const mockResponse = {
        data: {
          message: 'Promo code status updated successfully',
          status: 200
        }
      };

      axiosInstance.patch.mockResolvedValue(mockResponse);

      const promoCodeId = 'promo_ABC123';
      const isActive = false;

      const result = await promoCodeService.togglePromoCodeStatus(promoCodeId, isActive);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        `/promotion_code/${promoCodeId}/status`,
        { active: isActive }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});

import { useCallback, useEffect } from 'react';
import { useIAP as useRnIAP, initConnection, endConnection, getAvailablePurchases as getAvailablePurchasesLib, ErrorCode, type Purchase } from 'react-native-iap';
import { Alert, Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from './useTranslation';

const PRODUCT_ID = 'com.yuotsuka.taskboard.remove_ads';

export function useIAP() {
  const adsRemoved = useAppStore((s) => s.adsRemoved);
  const setAdsRemoved = useAppStore((s) => s.setAdsRemoved);
  const { t } = useTranslation();

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useRnIAP({
    onPurchaseSuccess: async (purchase: Purchase) => {
      if (purchase.productId === PRODUCT_ID) {
        await finishTransaction({ purchase });
        setAdsRemoved(true);
      }
    },
    onPurchaseError: (error) => {
      if (error.code !== ErrorCode.UserCancelled) {
        Alert.alert(t('iap.error'), t('iap.purchaseError', { message: error.message }));
      }
    },
  });

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    initConnection().then(() => {
      fetchProducts({ skus: [PRODUCT_ID] });
    }).catch(() => {});
    return () => { endConnection(); };
  }, []);

  const purchase = useCallback(async () => {
    if (!connected || adsRemoved) return;
    try {
      await requestPurchase({
        type: 'in-app',
        request: {
          apple: { sku: PRODUCT_ID, andDangerouslyFinishTransactionAutomatically: false },
        },
      });
    } catch (e: any) {
      if (e?.code !== ErrorCode.UserCancelled) {
        Alert.alert(t('iap.error'), t('iap.purchaseFailed'));
      }
    }
  }, [connected, adsRemoved, requestPurchase, t]);

  const restore = useCallback(async () => {
    try {
      const purchases = await getAvailablePurchasesLib();
      const found = purchases.some((p) => p.productId === PRODUCT_ID);
      if (found) {
        setAdsRemoved(true);
        Alert.alert(t('iap.restoreTitle'), t('iap.restoreMsg'));
      } else {
        Alert.alert(t('iap.restoreNotFoundTitle'), t('iap.restoreNotFound'));
      }
    } catch (e) {
      Alert.alert(t('iap.error'), t('iap.restoreError'));
    }
  }, [setAdsRemoved, t]);

  return { adsRemoved, loading: !connected, purchase, restore };
}

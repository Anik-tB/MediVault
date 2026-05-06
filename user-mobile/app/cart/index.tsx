import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette } from '@/constants/theme';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { getCartItems, updateCartQuantity, removeFromCart, clearCart } from '@/services/cart';

export default function CartScreen() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Live cart state
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        const data = await getCartItems();
        // Map backend snake_case to UI camelCase
        const mapped = data.map((item: any) => ({
          id: String(item.cart_item_id),
          name: item.name,
          rxRequired: item.rx_required,
          category: item.category,
          available: item.available,
          quantity: item.quantity,
        }));
        setCartItems(mapped);
      } catch (err: any) {
        setError(err.message || 'Failed to load cart');
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, []);

  const hasItems = cartItems.length > 0;
  const totalUnits = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const toggleSidebar = () => {
    const toValue = isSidebarOpen ? 0 : 1;
    if (!isSidebarOpen) setIsSidebarOpen(true);
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (isSidebarOpen) setIsSidebarOpen(false);
    });
  };

  const handleUpdateQuantity = async (cartItemId: string, newQty: number) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i));
    try {
      await updateCartQuantity(cartItemId, newQty);
    } catch {
      const data = await getCartItems();
      setCartItems(data.map((item: any) => ({
        id: String(item.cart_item_id), name: item.name, rxRequired: item.rx_required,
        category: item.category, available: item.available, quantity: item.quantity,
      })));
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== cartItemId));
    try { await removeFromCart(cartItemId); } catch (err) { console.error(err); }
  };

  const handleClearCart = async () => {
    setCartItems([]);
    try { await clearCart(); } catch (err) { console.error(err); }
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="My Cart" onOpenSidebar={toggleSidebar} />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Feather name="wifi-off" size={40} color="#94A3B8" />
          <Text style={styles.loadingText}>{error}</Text>
        </View>
      ) : (
      
      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerTitleContainer}>
              <View style={styles.cartIconContainer}>
                <Feather name="shopping-cart" size={24} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.pageTitle}>My Cart</Text>
                <Text style={styles.pageSubtitle}>
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · {totalUnits} total unit{totalUnits !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            {hasItems && (
              <Pressable onPress={handleClearCart}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </Pressable>
            )}
          </View>
        </View>

        {!hasItems ? (
          /* Empty State Card */
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrapper}>
              <Feather name="shopping-cart" size={48} color="#93C5FD" />
            </View>
            
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Browse the medicine catalog and add items to reserve them for pickup.
            </Text>

            <Pressable 
              style={styles.browseButton}
              onPress={() => router.push('/search_medicine')}
            >
              <Text style={styles.browseButtonText}>Browse Medicines</Text>
              <Feather name="arrow-right" size={18} color={Palette.surface} />
            </Pressable>
          </View>
        ) : (
          /* Populated State */
          <View style={styles.populatedContainer}>
            
            {/* Cart Items List */}
            <View style={styles.cartItemsList}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItemCard}>
                  <View style={styles.cartItemTopRow}>
                    <View style={styles.itemIconWrapper}>
                      <Feather name="package" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.itemInfo}>
                      <View style={styles.itemTitleRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.rxRequired && (
                          <View style={styles.rxBadge}>
                            <Text style={styles.rxBadgeText}>RX REQUIRED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.itemSubtitle}>
                        {item.category} · {item.available} available
                      </Text>
                    </View>
                    <Pressable style={styles.deleteBtn} onPress={() => handleRemoveItem(item.id)}>
                      <Feather name="trash-2" size={18} color="#CBD5E1" />
                    </Pressable>
                  </View>
                  
                  <View style={styles.quantityRow}>
                    <Text style={styles.quantityLabel}>QUANTITY</Text>
                    <View style={styles.quantityControls}>
                      <Pressable style={styles.qtyBtnMinus} onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                        <Feather name="minus" size={16} color="#64748B" />
                      </Pressable>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <Pressable style={styles.qtyBtnPlus} onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                        <Feather name="plus" size={16} color="#2563EB" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Medicine types</Text>
                <Text style={styles.summaryValue}>{cartItems.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total units</Text>
                <Text style={styles.summaryValue}>{totalUnits}</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Pending Pickup</Text>
                </View>
              </View>
              
              {cartItems.some(item => item.rxRequired) && (
                <View style={styles.alertBox}>
                  <Feather name="check-circle" size={16} color="#2563EB" style={styles.alertIcon} />
                  <Text style={styles.alertText}>
                    Some items require a prescription. Please upload before pickup.
                  </Text>
                </View>
              )}
              
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Reserve for Pickup</Text>
                <Feather name="arrow-right" size={18} color="#FFFFFF" />
              </Pressable>
              
              <Pressable 
                style={styles.secondaryButton}
                onPress={() => router.push('/search_medicine')}
              >
                <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
              </Pressable>
            </View>

          </View>
        )}
      </ScrollView>

      )}

      {isSidebarOpen && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={toggleSidebar} 
          slideAnim={slideAnim} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cartIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Palette.textSoft,
    marginTop: 2,
  },
  clearAllText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: Palette.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Palette.textSoft,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  browseButtonText: {
    color: Palette.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  populatedContainer: {
    gap: 24,
  },
  cartItemsList: {
    gap: 16,
  },
  cartItemCard: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cartItemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  itemIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  rxBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  rxBadgeText: {
    color: '#2563EB',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemSubtitle: {
    fontSize: 13,
    color: Palette.textSoft,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  qtyBtnMinus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
    minWidth: 12,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
  },
  statusBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusBadgeText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  alertIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#1E3A8A',
    fontWeight: '500',
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
});

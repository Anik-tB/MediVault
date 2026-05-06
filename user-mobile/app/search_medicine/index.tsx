import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Pressable, 
  Animated,
  Alert,
  Platform
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Palette } from '@/constants/theme';
import { DashboardHeader, Sidebar } from '@/components/dashboard/DashboardComponents';
import { fetchMedicines } from '@/services/medicines';
import { addToCart } from '@/services/cart';

// Types
type MedicineCategory = 
  | 'All' 
  | 'Antibiotic' 
  | 'Painkiller' 
  | 'Anticoagulant' 
  | 'Blood Pressure' 
  | 'Diabetes' 
  | 'Antihistamine' 
  | 'Antacid';

interface Medicine {
  id: string;
  name: string;
  rx: boolean;
  certificate: boolean;
  category: MedicineCategory;
  categoryIcon: keyof typeof Feather.glyphMap;
  description: string;
  stock: number; // 0 means out of stock
}

const CATEGORIES: MedicineCategory[] = [
  'All', 
  'Antibiotic', 
  'Painkiller', 
  'Anticoagulant', 
  'Blood Pressure', 
  'Diabetes', 
  'Antihistamine', 
  'Antacid'
];

const MEDICINES_DATA: Medicine[] = [
  {
    id: '1',
    name: 'Amoxicillin',
    rx: true,
    certificate: false,
    category: 'Antibiotic',
    categoryIcon: 'activity',
    description: 'Broad-spectrum antibiotic used to treat bacterial infections including respiratory tract...',
    stock: 150,
  },
  {
    id: '2',
    name: 'Ibuprofen',
    rx: false,
    certificate: true,
    category: 'Painkiller',
    categoryIcon: 'heart',
    description: 'Non-steroidal anti-inflammatory drug (NSAID) used to relieve pain, reduce inflammation, and...',
    stock: 20,
  },
  {
    id: '3',
    name: 'Aspirin',
    rx: false,
    certificate: true,
    category: 'Painkiller',
    categoryIcon: 'heart',
    description: 'Used for pain relief, fever reduction, and as a blood thinner to prevent heart attacks and strokes.',
    stock: 300,
  },
  {
    id: '4',
    name: 'Warfarin',
    rx: true,
    certificate: true,
    category: 'Anticoagulant',
    categoryIcon: 'droplet',
    description: 'Blood thinner medication used to treat and prevent blood clots. Requires regular monitoring.',
    stock: 30,
  },
  {
    id: '5',
    name: 'Lisinopril',
    rx: true,
    certificate: false,
    category: 'Blood Pressure',
    categoryIcon: 'activity',
    description: 'ACE inhibitor used to treat high blood pressure, heart failure, and prevent kidney...',
    stock: 0,
  },
  {
    id: '6',
    name: 'Metformin',
    rx: true,
    certificate: false,
    category: 'Diabetes',
    categoryIcon: 'plus-square',
    description: 'First-line medication for type 2 diabetes. Improves insulin sensitivity and reduces glucose production.',
    stock: 200,
  },
  {
    id: '7',
    name: 'Cetirizine',
    rx: false,
    certificate: false,
    category: 'Antihistamine',
    categoryIcon: 'wind',
    description: 'Second-generation antihistamine used to treat hay fever, allergies, and chronic urticaria.',
    stock: 85,
  },
  {
    id: '8',
    name: 'Omeprazole',
    rx: false,
    certificate: false,
    category: 'Antacid',
    categoryIcon: 'coffee',
    description: 'Proton-pump inhibitor that reduces stomach acid production. Used for GERD and peptic...',
    stock: 32,
  },
];

export default function SearchMedicinesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MedicineCategory>('All');
  
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch medicines from backend
  useEffect(() => {
    let isMounted = true;
    
    const loadMedicines = async () => {
      setIsLoading(true);
      try {
        // Debounce or directly fetch, for simplicity fetch directly based on state
        const data = await fetchMedicines(searchQuery, selectedCategory);
        if (isMounted) {
          setMedicines(data);
        }
      } catch (error) {
        console.error('Failed to load medicines:', error);
        // Fallback to empty or toast error
        if (isMounted) setMedicines([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Debounce the search input
    const timeoutId = setTimeout(() => {
      loadMedicines();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = async (medicineId: string, medicineName: string) => {
    try {
      await addToCart(medicineId, 1);
      
      // Show custom toast message
      setToastMessage(`${medicineName} added to cart successfully!`);
      setTimeout(() => setToastMessage(null), 3000); // Hide after 3s

    } catch (error: any) {
      setToastMessage(`Error: ${error.message || 'Failed to add to cart.'}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

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

  // Client-side filtering is no longer needed as the backend handles it,
  // but we use the state `medicines` directly.
  const filteredMedicines = medicines;

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: '#EF4444', percent: 0 };
    if (stock < 50) return { label: `${stock} units`, color: '#F59E0B', percent: stock }; // orange
    return { label: `${stock} units`, color: '#10B981', percent: Math.min(100, stock) }; // green
  };

  return (
    <View style={styles.container}>
      <DashboardHeader title="Search Medicines" onOpenSidebar={toggleSidebar} />
      
      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Search Medicines</Text>
          <Text style={styles.pageSubtitle}>Browse and add medicines to your cart.</Text>

          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={Palette.textSoft} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by medicine name, symptom..."
              placeholderTextColor={Palette.textSoft}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Pressable 
                  key={cat} 
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Medicines List */}
        <View style={styles.listContainer}>
          {filteredMedicines.map((med) => {
            const status = getStockStatus(med.stock);
            return (
              <View key={med.id} style={styles.card}>
                {/* Top Border Indicator */}
                <View style={[styles.cardTopBorder, { backgroundColor: status.color }]} />
                
                <View style={styles.cardContent}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.medicineName}>{med.name}</Text>
                    <View style={styles.badgesContainer}>
                      {med.rx && (
                        <View style={styles.rxBadge}>
                          <Text style={styles.rxBadgeText}>RX</Text>
                        </View>
                      )}
                      {med.certificate && (
                        <View style={styles.certBadge}>
                          <MaterialIcons name="warning" size={12} color="#D97706" />
                          <Text style={styles.certBadgeText}>Certificate</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Category Tag */}
                  <View style={styles.tagContainer}>
                    <Feather name={med.categoryIcon} size={12} color="#2563EB" />
                    <Text style={styles.tagText}>{med.category}</Text>
                  </View>

                  {/* Description */}
                  <Text style={styles.descriptionText} numberOfLines={2}>
                    {med.description}
                  </Text>

                  {/* Availability */}
                  <View style={styles.availabilityContainer}>
                    {med.stock > 0 ? (
                      <>
                        <Text style={styles.availabilityLabel}>Availability</Text>
                        <Text style={[styles.availabilityValue, { color: status.color }]}>
                          {status.label}
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.availabilityLabel, { color: '#EF4444', fontWeight: '600' }]}>
                        Out of Stock
                      </Text>
                    )}
                  </View>

                  {/* Progress bar for stock */}
                  {med.stock > 0 && (
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${status.percent}%`, backgroundColor: status.color }
                        ]} 
                      />
                    </View>
                  )}

                  {/* Add to Cart Button */}
                  <Pressable 
                    style={[styles.addToCartButton, med.stock === 0 && styles.addToCartDisabled]}
                    disabled={med.stock === 0}
                    onPress={() => handleAddToCart(med.id, med.name)}
                  >
                    {med.stock > 0 ? (
                      <>
                        <Feather name="shopping-cart" size={16} color="#FFF" />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                      </>
                    ) : (
                      <Text style={styles.addToCartTextDisabled}>Out of Stock</Text>
                    )}
                  </Pressable>

                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {isSidebarOpen && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={toggleSidebar} 
          slideAnim={slideAnim} 
        />
      )}

      {/* Custom Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Feather name={toastMessage.startsWith('Error') ? "alert-circle" : "check-circle"} size={20} color="#FFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Palette.textSoft,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Palette.text,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryTextSelected: {
    color: '#FFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopBorder: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
  },
  badgesContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rxBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rxBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 4,
  },
  certBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  descriptionText: {
    fontSize: 13,
    color: Palette.textSoft,
    lineHeight: 20,
    marginBottom: 16,
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityLabel: {
    fontSize: 12,
    color: Palette.textSoft,
  },
  availabilityValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addToCartDisabled: {
    backgroundColor: '#F1F5F9',
    marginTop: 16,
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  addToCartTextDisabled: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

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
  Platform,
  Modal,
  Image
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
  price: number;
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

const MEDICINE_IMAGES: Record<string, string> = {
  'Amoxicillin': 'https://wellonapharma.com/admincms/product_img/product_resize_img/amoxicillin-tablets_1732540129.jpg',
  'Ibuprofen': 'https://5.imimg.com/data5/SELLER/Default/2023/7/325863554/WI/JM/SY/135658020/ibuprofen-tablets-ip-200-mg-.jpg',
  'Aspirin': 'https://5.imimg.com/data5/SELLER/Default/2023/7/330506870/UM/GZ/QO/135658020/aspirin-dispersible-tablets.jpg',
  'Warfarin': 'https://www.healingpharma.in/wp-content/uploads/2022/03/Angiotensin-10-new.jpg',
  'Lisinopril': 'https://www.healingpharma.in/wp-content/uploads/2022/03/Angiotensin-10-new.jpg',
  'Metformin': 'https://images.ctfassets.net/4w8qvp17lo47/6vXaH4Y5Gw6AMEmASwGkc6/e6ff962a82811e4d160cc2d5c0d8b3cb/metformin-antidiabetic-tablets-science-photo-library.jpg',
  'Cetirizine': 'https://cdn2.arogga.com/eyJidWNrZXQiOiJhcm9nZ2EiLCJrZXkiOiJQcm9kdWN0LXBfaW1hZ2VzXC8zODY4XC8zODY4LUNldGlyaXppbmUtMTBtZy16dWhhdjguanBlZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6MTAwMCwiaGVpZ2h0IjoxMDAwLCJmaXQiOiJvdXRzaWRlIn0sIm92ZXJsYXlXaXRoIjp7ImJ1Y2tldCI6ImFyb2dnYSIsImtleSI6Im1pc2NcL3dtLnBuZyIsImFscGhhIjo5MH19fQ==',
  'Omeprazole': 'https://www.pharmulous.co.uk/uploads/images/products/large/pharmulous-omeprazole-1750179931Omep.jpg',
  'Azithromycin 500mg': 'https://www.albionbd.com/wp-content/uploads/2021/08/Azithromycin-500-Tablet.jpg',
  'Cefuroxime 500mg': 'https://www.arogga.com/_next/image?url=https%3A%2F%2Fcdn2.arogga.com%2FeyJidWNrZXQiOiJhcm9nZ2EiLCJrZXkiOiJQcm9kdWN0LXBfaW1hZ2VzXC8zNzE0XC8zNzE0LWNlZnV4aW0tNTAwLWNvcHktanJnMGEyLmpwZWciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjEwMDAsImhlaWdodCI6MTAwMCwiZml0Ijoib3V0c2lkZSJ9LCJvdmVybGF5V2l0aCI6eyJidWNrZXQiOiJhcm9nZ2EiLCJrZXkiOiJtaXNjXC93bS5wbmciLCJhbHBoYSI6OTB9fX0%3D&w=1280&q=75',
  'Amlodipine 5mg': 'https://medecify.com/wp-content/uploads/2024/10/DF-EEDF-A-BE-F-B-3000x3000.jpeg',
  'Atorvastatin 10mg': 'https://cmedia.cheapmedicineshop.com/media/iopt/catalog/product/cache/207e23213cf636ccdef205098cf3c8a3/l/i/lipavas_10mg.webp',
  'Esomeprazole 20mg': 'https://cdn.osudpotro.com/medicine/c4a9c7ed-3007-4da8-9c56-c979b7998ebb-1772183303-1772183320786.webp',
  'Pantoprazole 40mg': 'https://cdn2.arogga.com/eyJidWNrZXQiOiJhcm9nZ2EiLCJrZXkiOiJQcm9kdWN0LXBfaW1hZ2VzXC8xNDUwNVwvMTQ1MDUtUGFudG9wcmF6b2xlLTQwLWNvcHktenp4eHI3LmpwZWciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjEwMDAsImhlaWdodCI6MTAwMCwiZml0Ijoib3V0c2lkZSJ9LCJvdmVybGF5V2l0aCI6eyJidWNrZXQiOiJhcm9nZ2EiLCJrZXkiOiJtaXNjXC93bS5wbmciLCJhbHBoYSI6OTB9fX0=',
  'Montelukast 10mg': 'https://cdn.osudpotro.com/medicine/Monteluk-10-mg-1611232494915.webp',
  'Salbutamol Inhaler': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC9UYmXIIGqki1n0ujc6Sp1be0YqIetX2xJA&s',
  'Vitamin C (Ceevit)': 'https://medeasy.health/_next/image?url=https%3A%2F%2Fapi.medeasy.health%2Fmedia%2Fmedicines%2Fmedeasy_ceevit_ds.jpg&w=3840&q=75',
  'B-Complex (B-50 Forte)': 'https://i5.walmartimages.com/seo/Eternal-B-Complex-B1-B2-B3-B6-B12-60-Tablets_446660a3-c7ce-4a8b-994e-b5779dc0cd9e.cecd4408df03ae8f94615b3c22cfd99b.jpeg',
  'Paracetamol 500mg (Napa)': 'https://cdn2.arogga.com/eyJidWNrZXQiOiJhcm9nZ2EiLCJrZXkiOiJQcm9kdWN0LXBfaW1hZ2VzXC8xMjQ3NFwvMTI0NzQtTmFwYS05am5kNnQuanBlZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6MTAwMCwiaGVpZ2h0IjoxMDAwLCJmaXQiOiJvdXRzaWRlIn0sIm92ZXJsYXlXaXRoIjp7ImJ1Y2tldCI6ImFyb2dnYSIsImtleSI6Im1pc2NcL3dtLnBuZyIsImFscGhhIjo5MH19fQ==',
  'Diclofenac Gel': 'https://www.padagis.com/wp-content/uploads/2025/09/Diclofenac_Gel_OTC.png',
  'Metformin 500mg': 'https://www.arogga.com/_next/image?url=https%3A%2F%2Fcdn2.arogga.com%2FeyJidWNrZXQiOiJhcm9nZ2EiLCJrZXkiOiJQcm9kdWN0LXBfaW1hZ2VzXC8xMTYxMlwvMTE2MTItTWV0Zm9ybS01MDAtMC1jb3B5LXBvajR4cy5qcGVnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjoxMDAwLCJoZWlnaHQiOjEwMDAsImZpdCI6Im91dHNpZGUifSwib3ZlcmxheVdpdGgiOnsiYnVja2V0IjoiYXJvZ2dhIiwia2V5IjoibWlzY1wvd20ucG5nIiwiYWxwaGEiOjkwfX19&w=1280&q=75',
  'Sitagliptin 50mg': 'https://xalmeds.com/cdn/shop/files/IMG-7642.jpg?v=1772952745',
  'Fexofenadine 120mg': 'https://i.chaldn.com/_mpimage/fexo-tablet-120mg-10-tablets?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D106911&q=low&v=1'
};

const MEDICINE_CONTENTS: Record<string, string> = {
  'Amoxicillin': '10 Capsules per strip',
  'Ibuprofen': '10 Tablets per strip',
  'Aspirin': '10 Tablets per strip',
  'Warfarin': '10 Tablets per strip',
  'Lisinopril': '10 Tablets per strip',
  'Metformin': '10 Tablets per strip',
  'Cetirizine': '10 Tablets per strip',
  'Omeprazole': '14 Capsules per strip',
  'Azithromycin 500mg': '6 Tablets per strip',
  'Cefuroxime 500mg': '10 Tablets per strip',
  'Amlodipine 5mg': '14 Tablets per strip',
  'Atorvastatin 10mg': '10 Tablets per strip',
  'Esomeprazole 20mg': '14 Capsules per strip',
  'Pantoprazole 40mg': '14 Tablets per strip',
  'Montelukast 10mg': '10 Tablets per strip',
  'Salbutamol Inhaler': '1 Inhaler (200 Doses)',
  'Vitamin C (Ceevit)': '10 Chewable Tablets per strip',
  'B-Complex (B-50 Forte)': '60 Tablets per bottle',
  'Paracetamol 500mg (Napa)': '10 Tablets per strip',
  'Diclofenac Gel': '1 Tube (100g)',
  'Metformin 500mg': '10 Tablets per strip',
  'Sitagliptin 50mg': '10 Tablets per strip',
  'Fexofenadine 120mg': '10 Tablets per strip'
};

const MEDICINE_DOSES: Record<string, string> = {
  'Amoxicillin': '500mg (as prescribed)',
  'Ibuprofen': '400mg (as prescribed)',
  'Aspirin': '300mg (as prescribed)',
  'Warfarin': '10mg (as prescribed)',
  'Lisinopril': '10mg (as prescribed)',
  'Metformin': '500mg (as prescribed)',
  'Cetirizine': '10mg (as prescribed)',
  'Omeprazole': '20mg (as prescribed)',
  'Azithromycin 500mg': '500mg (as prescribed)',
  'Cefuroxime 500mg': '500mg (as prescribed)',
  'Amlodipine 5mg': '5mg (as prescribed)',
  'Atorvastatin 10mg': '10mg (as prescribed)',
  'Esomeprazole 20mg': '20mg (as prescribed)',
  'Pantoprazole 40mg': '40mg (as prescribed)',
  'Montelukast 10mg': '10mg (as prescribed)',
  'Salbutamol Inhaler': '100mcg per actuation',
  'Vitamin C (Ceevit)': '500mg (as prescribed)',
  'B-Complex (B-50 Forte)': '1 Tablet daily',
  'Paracetamol 500mg (Napa)': '500mg (as prescribed)',
  'Diclofenac Gel': 'Apply to affected area',
  'Metformin 500mg': '500mg (as prescribed)',
  'Sitagliptin 50mg': '50mg (as prescribed)',
  'Fexofenadine 120mg': '120mg (as prescribed)'
};

export default function SearchMedicinesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MedicineCategory>('All');

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [interactionWarning, setInteractionWarning] = useState<{ visible: boolean; severity: string; message: string; clinicalDescription?: string }>({ visible: false, severity: '', message: '' });

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
      if (error.isInteractionWarning) {
        setInteractionWarning({
          visible: true,
          severity: error.severity || 'severe',
          message: error.message,
          clinicalDescription: error.clinicalDescription
        });
      } else {
        setToastMessage(`Error: ${error.message || 'Failed to add to cart.'}`);
        setTimeout(() => setToastMessage(null), 4000);
      }
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
            return (
              <View key={med.id} style={styles.card}>
                <View style={styles.cardContent}>
                  {/* Top Section: Name/Tag and Price/Badges */}
                  <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                      <Text style={styles.medicineName}>{med.name}</Text>
                      <View style={styles.tagContainer}>
                        <Feather name={med.categoryIcon} size={12} color="#2563EB" />
                        <Text style={styles.tagText}>{med.category}</Text>
                      </View>
                    </View>

                    <View style={styles.headerRight}>
                      <Text style={styles.priceText}>৳{med.price.toFixed(2)}</Text>
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
                  </View>

                  {/* Center: Image */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: MEDICINE_IMAGES[med.name] || 'https://via.placeholder.com/300x150.png?text=Medicine+Image' }}
                      style={styles.medicineImage}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Medicine Details */}
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>USAGE:</Text> {med.description}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>DOSE:</Text> {MEDICINE_DOSES[med.name] || 'As prescribed'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>CONTENTS:</Text> {MEDICINE_CONTENTS[med.name] || 'Standard Pack'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>TYPE:</Text> {med.category}
                      </Text>
                    </View>
                  </View>

                  {/* Stock and Availability */}
                  <View style={styles.stockInfoContainer}>
                    {med.stock > 0 ? (
                      <>
                        <View style={styles.inStockContainer}>
                          <Text style={styles.inStockText}>In Stock</Text>
                          <MaterialIcons name="check-circle" size={18} color="#10B981" />
                        </View>
                        <Text style={styles.availabilityText}>
                          Availability: {med.stock} units
                        </Text>
                      </>
                    ) : (
                      <>
                        <View style={styles.outOfStockContainer}>
                          <Text style={styles.outOfStockText}>Out of Stock</Text>
                          <MaterialIcons name="cancel" size={18} color="#EF4444" />
                        </View>
                        <Text style={styles.availabilityText}>
                          Availability: 0 units
                        </Text>
                      </>
                    )}
                  </View>

                  {/* Add to Cart Button */}
                  <Pressable
                    style={[styles.addToCartButton, med.stock === 0 && styles.addToCartDisabled]}
                    disabled={med.stock === 0}
                    onPress={() => handleAddToCart(med.id, med.name)}
                  >
                    <Feather name="shopping-cart" size={18} color={med.stock > 0 ? "#FFF" : "#94A3B8"} />
                    <Text style={med.stock > 0 ? styles.addToCartText : styles.addToCartTextDisabled}>
                      ADD TO CART
                    </Text>
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

      {/* Interaction Warning Modal */}
      <Modal
        visible={interactionWarning.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInteractionWarning(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconWrapper, { backgroundColor: interactionWarning.severity === 'severe' ? '#FEE2E2' : '#FEF3C7' }]}>
              <Feather name="alert-triangle" size={32} color={interactionWarning.severity === 'severe' ? '#EF4444' : '#D97706'} />
            </View>
            <Text style={styles.modalTitle}>Interaction Warning</Text>
            <Text style={styles.modalMessage}>
              {interactionWarning.message}
            </Text>
            {interactionWarning.clinicalDescription && (
              <View style={styles.modalMedicineList}>
                <Text style={styles.modalMedicineItem}>
                  {interactionWarning.clinicalDescription}
                </Text>
              </View>
            )}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalUploadBtn, { backgroundColor: '#F1F5F9' }]}
                onPress={() => setInteractionWarning(prev => ({ ...prev, visible: false }))}
              >
                <Text style={[styles.modalUploadBtnText, { color: '#475569' }]}>Acknowledge</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  modalMedicineList: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalMedicineItem: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    lineHeight: 20,
  },
  modalActions: {
    width: '100%',
    gap: 12,
  },
  modalUploadBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  modalUploadBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  medicineName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  rxBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rxBadgeText: {
    fontSize: 12,
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  medicineImage: {
    width: 280,
    height: 160,
  },
  detailsContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#0F172A',
    marginRight: 6,
    lineHeight: 22,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  detailLabel: {
    fontWeight: '800',
    color: '#0F172A',
  },
  stockInfoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  inStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  inStockText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  outOfStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  outOfStockText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  availabilityText: {
    fontSize: 13,
    color: '#475569',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addToCartDisabled: {
    backgroundColor: '#F1F5F9',
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  addToCartTextDisabled: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '700',
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

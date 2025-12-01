import React, { useState, useMemo, useCallback, useEffect } from "react";
import { products } from "./data.js";

const ProductSearchApp = () => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [customPercentage, setCustomPercentage] = useState(0);
  const [sortBy, setSortBy] = useState("name");
  const [currencyRates, setCurrencyRates] = useState({});
  const [loadingRates, setLoadingRates] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [percentageInput, setPercentageInput] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [directQuantity, setDirectQuantity] = useState("");
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [productsToShow, setProductsToShow] = useState(50); // Initial products to display

  // Clean products data with original count
  const cleanedProducts = useMemo(() => {
    return products.map((product) => ({
      id: product.id || Math.random().toString(36).substr(2, 9),
      BRAND_NAME: product.BRAND_NAME || "Unknown Product",
      COMPOSITION: product.COMPOSITION || "No Composition Info",
      packing: product.packing || "No Packaging Info",
      price: product.price || 0,
      count: product.count || 1,
    }));
  }, []);

  // Real-time Currency API with multiple fallbacks
  const fetchCurrencyRates = useCallback(async () => {
    setLoadingRates(true);
    try {
      // Try multiple APIs for better reliability
      const APIs = [
        "https://api.exchangerate-api.com/v4/latest/INR",
        "https://api.frankfurter.app/latest?from=INR",
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json",
      ];

      let ratesData = null;

      for (const apiUrl of APIs) {
        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            ratesData = await response.json();
            break;
          }
        } catch (error) {
          console.log(`API ${apiUrl} failed, trying next...`);
          continue;
        }
      }

      if (!ratesData) {
        throw new Error("All currency APIs failed");
      }

      // Extract rates from different API response formats
      let rates = {};

      if (ratesData.rates) {
        // exchangerate-api format
        rates = ratesData.rates;
      } else if (ratesData.conversion_rates) {
        // Some APIs use conversion_rates
        rates = ratesData.conversion_rates;
      } else if (ratesData.inr) {
        // fawazahmed0 API format
        rates = ratesData.inr;
      }

      const currencyRatesMap = {
        INR: {
          rate: 1,
          symbol: "₹",
          name: "Indian Rupee",
          realTimeRate: 1,
        },
        USD: {
          rate: rates.USD || rates.usd || 0.012,
          symbol: "$",
          name: "US Dollar",
          realTimeRate: rates.USD || rates.usd || 0.012,
        },
        EUR: {
          rate: rates.EUR || rates.eur || 0.011,
          symbol: "€",
          name: "Euro",
          realTimeRate: rates.EUR || rates.eur || 0.011,
        },
        GBP: {
          rate: rates.GBP || rates.gbp || 0.0095,
          symbol: "£",
          name: "British Pound",
          realTimeRate: rates.GBP || rates.gbp || 0.0095,
        },
        JPY: {
          rate: rates.JPY || rates.jpy || 1.78,
          symbol: "¥",
          name: "Japanese Yen",
          realTimeRate: rates.JPY || rates.jpy || 1.78,
        },
        AUD: {
          rate: rates.AUD || rates.aud || 0.018,
          symbol: "A$",
          name: "Australian Dollar",
          realTimeRate: rates.AUD || rates.aud || 0.018,
        },
        CAD: {
          rate: rates.CAD || rates.cad || 0.016,
          symbol: "C$",
          name: "Canadian Dollar",
          realTimeRate: rates.CAD || rates.cad || 0.016,
        },
        CHF: {
          rate: rates.CHF || rates.chf || 0.011,
          symbol: "CHF",
          name: "Swiss Franc",
          realTimeRate: rates.CHF || rates.chf || 0.011,
        },
        CNY: {
          rate: rates.CNY || rates.cny || 0.087,
          symbol: "¥",
          name: "Chinese Yuan",
          realTimeRate: rates.CNY || rates.cny || 0.087,
        },
        AED: {
          rate: rates.AED || rates.aed || 0.044,
          symbol: "AED",
          name: "UAE Dirham",
          realTimeRate: rates.AED || rates.aed || 0.044,
        },
        SAR: {
          rate: rates.SAR || rates.sar || 0.045,
          symbol: "SAR",
          name: "Saudi Riyal",
          realTimeRate: rates.SAR || rates.sar || 0.045,
        },
        SGD: {
          rate: rates.SGD || rates.sgd || 0.016,
          symbol: "S$",
          name: "Singapore Dollar",
          realTimeRate: rates.SGD || rates.sgd || 0.016,
        },
      };

      setCurrencyRates(currencyRatesMap);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Currency API error:", error);
      // Fallback to Google Finance approximate rates
      const fallbackRates = {
        INR: { rate: 1, symbol: "₹", name: "Indian Rupee", realTimeRate: 1 },
        USD: {
          rate: 0.012,
          symbol: "$",
          name: "US Dollar",
          realTimeRate: 0.012,
        },
        EUR: { rate: 0.011, symbol: "€", name: "Euro", realTimeRate: 0.011 },
        GBP: {
          rate: 0.0095,
          symbol: "£",
          name: "British Pound",
          realTimeRate: 0.0095,
        },
        JPY: {
          rate: 1.78,
          symbol: "¥",
          name: "Japanese Yen",
          realTimeRate: 1.78,
        },
        AUD: {
          rate: 0.018,
          symbol: "A$",
          name: "Australian Dollar",
          realTimeRate: 0.018,
        },
        CAD: {
          rate: 0.016,
          symbol: "C$",
          name: "Canadian Dollar",
          realTimeRate: 0.016,
        },
        CHF: {
          rate: 0.011,
          symbol: "CHF",
          name: "Swiss Franc",
          realTimeRate: 0.011,
        },
        CNY: {
          rate: 0.087,
          symbol: "¥",
          name: "Chinese Yuan",
          realTimeRate: 0.087,
        },
        AED: {
          rate: 0.044,
          symbol: "AED",
          name: "UAE Dirham",
          realTimeRate: 0.044,
        },
        SAR: {
          rate: 0.045,
          symbol: "SAR",
          name: "Saudi Riyal",
          realTimeRate: 0.045,
        },
        SGD: {
          rate: 0.016,
          symbol: "S$",
          name: "Singapore Dollar",
          realTimeRate: 0.016,
        },
      };
      setCurrencyRates(fallbackRates);
      setLastUpdated("Fallback rates - " + new Date().toLocaleTimeString());
    } finally {
      setLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrencyRates();
    // Refresh rates every 2 minutes for real-time updates
    const interval = setInterval(fetchCurrencyRates, 120000);
    return () => clearInterval(interval);
  }, [fetchCurrencyRates]);

  // Filter products by BRAND_NAME only
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      if (showAllProducts) {
        // Return sorted all products
        return [...cleanedProducts].sort((a, b) => {
          switch (sortBy) {
            case "name":
              return (a.BRAND_NAME || "").localeCompare(b.BRAND_NAME || "");
            case "price-low":
              return (a.price || 0) - (b.price || 0);
            case "price-high":
              return (b.price || 0) - (a.price || 0);
            default:
              return 0;
          }
        });
      }
      return [];
    }

    let filtered = cleanedProducts.filter((product) => {
      const productBrandName = product.BRAND_NAME || "";
      const searchText = searchTerm.trim().toLowerCase();

      return productBrandName.toLowerCase().includes(searchText);
    });

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.BRAND_NAME || "").localeCompare(b.BRAND_NAME || "");
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, sortBy, cleanedProducts, showAllProducts]);

  // Calculate totals with real-time currency conversion
  const calculateTotals = useCallback(() => {
    const subtotalINR = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    const extraAmountINR = subtotalINR * (customPercentage / 100);
    const finalTotalINR = subtotalINR + extraAmountINR;

    // Get current real-time currency rate
    const currentCurrency = currencyRates[selectedCurrency];
    const conversionRate = currentCurrency ? currentCurrency.realTimeRate : 1;

    // Convert all amounts to selected currency using real-time rates
    const subtotalConverted = subtotalINR * conversionRate;
    const extraAmountConverted = extraAmountINR * conversionRate;
    const finalTotalConverted = finalTotalINR * conversionRate;

    return {
      baseTotalINR: subtotalINR,
      finalTotalINR: finalTotalINR,
      baseTotalConverted: subtotalConverted,
      finalTotalConverted: finalTotalConverted,
      extraAmountINR: extraAmountINR,
      extraAmountConverted: extraAmountConverted,
      conversionRate: conversionRate,
    };
  }, [cart, customPercentage, selectedCurrency, currencyRates]);

  const {
    baseTotalINR,
    finalTotalINR,
    baseTotalConverted,
    finalTotalConverted,
    extraAmountINR,
    extraAmountConverted,
    conversionRate,
  } = calculateTotals();

  // Add to cart with direct quantity
  const addToCartWithQuantity = useCallback((product, quantity = 1) => {
    const safeProduct = {
      id: product.id,
      BRAND_NAME: product.BRAND_NAME,
      COMPOSITION: product.COMPOSITION,
      packing: product.packing,
      price: product.price,
      count: product.count,
      quantity: parseInt(quantity) || 1,
    };

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === safeProduct.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === safeProduct.id
            ? { ...item, quantity: item.quantity + safeProduct.quantity }
            : item
        );
      } else {
        return [...prevCart, safeProduct];
      }
    });

    // Reset direct quantity input
    setDirectQuantity("");
  }, []);

  // Update quantity
  const updateQuantity = useCallback((id, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  // Set direct quantity for cart item
  const setDirectCartQuantity = useCallback((id, quantity) => {
    const qty = parseInt(quantity) || 0;
    if (qty < 0) return;

    setCart((prevCart) => {
      if (qty === 0) {
        return prevCart.filter((item) => item.id !== id);
      }

      const existingItem = prevCart.find((item) => item.id === id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === id ? { ...item, quantity: qty } : item
        );
      }

      return prevCart;
    });
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  }, []);

  // Apply custom percentage
  const applyCustomPercentage = useCallback(() => {
    const percentageValue = parseFloat(percentageInput);
    if (!isNaN(percentageValue) && percentageValue >= 0) {
      setCustomPercentage(percentageValue);
      setPercentageInput("");
    }
  }, [percentageInput]);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    setCustomPercentage(0);
    setPercentageInput("");
    setDirectQuantity("");
  }, []);

  // Format currency with real-time rates
  const formatCurrency = useCallback(
    (amount) => {
      const currency = currencyRates[selectedCurrency];
      if (!currency) {
        return `₹ ${amount.toFixed(2)}`;
      }

      const formattedAmount = amount * currency.realTimeRate;

      // Show more decimal places for very small amounts
      if (formattedAmount < 1 && formattedAmount > 0) {
        return `${currency.symbol} ${formattedAmount.toFixed(4)}`;
      }

      return `${currency.symbol} ${formattedAmount.toFixed(2)}`;
    },
    [selectedCurrency, currencyRates]
  );

  // Get current currency
  const getCurrentCurrency = useCallback(() => {
    return (
      currencyRates[selectedCurrency] || {
        rate: 1,
        realTimeRate: 1,
        symbol: "₹",
        name: "Indian Rupee",
      }
    );
  }, [selectedCurrency, currencyRates]);

  // Calculate cart items count
  const cartItemsCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Get currency options
  const currencyOptions = useMemo(() => {
    return Object.entries(currencyRates).map(([code, data]) => ({
      code,
      ...data,
    }));
  }, [currencyRates]);

  // View product details
  const viewProductDetails = (product) => {
    setSelectedProduct(product);
  };

  // Close product details
  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  // Handle direct quantity input
  const handleDirectQuantityChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*$/.test(value)) {
      setDirectQuantity(value);
    }
  };

  // Handle load more products
  const handleLoadMore = () => {
    setProductsToShow((prev) => prev + 50);
  };

  // Toggle show all products
  const toggleShowAllProducts = () => {
    setShowAllProducts(!showAllProducts);
    if (!showAllProducts) {
      setProductsToShow(50); // Reset to initial when showing all
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setShowAllProducts(false);
    setProductsToShow(50);
  };

  // Get products to display (for pagination)
  const productsToDisplay = useMemo(() => {
    return filteredProducts.slice(0, productsToShow);
  }, [filteredProducts, productsToShow]);

  // Get total products count
  const totalProducts = cleanedProducts.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            💊 Pharma Search
          </h1>
          <p className="text-md text-gray-700">
            Search from {totalProducts}+ pharmaceutical products
          </p>

          {/* Currency Status */}
          <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-2 text-sm">
            <div
              className={`px-3 py-1 rounded-full ${
                loadingRates
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {loadingRates ? (
                <span className="flex items-center gap-1">
                  <span className="animate-spin">⟳</span>
                  Updating rates...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span>✓</span>
                  Live rates: {lastUpdated}
                </span>
              )}
            </div>
            <button
              onClick={fetchCurrencyRates}
              disabled={loadingRates}
              className="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-400 text-xs flex items-center gap-1"
            >
              <span className={loadingRates ? "animate-spin" : ""}>⟳</span>
              Refresh Rates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Search and Products */}
          <div className="xl:col-span-3 space-y-6">
            {/* Search Card */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Search Bar */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-purple-700 mb-2">
                    🔍 Search Products
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type BRAND NAME to search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 bg-white"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-purple-500">💊</span>
                    </div>
                    {searchTerm && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    📊 Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-800"
                  >
                    <option value="name">BRAND NAME (A-Z)</option>
                    <option value="price-low">Price (Low to High)</option>
                    <option value="price-high">Price (High to Low)</option>
                  </select>
                </div>
              </div>

              {/* Show All Products Toggle */}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {searchTerm ? (
                    <>
                      Searching in {totalProducts} products
                      {filteredProducts.length > 0 && (
                        <span className="ml-2 text-green-600 font-semibold">
                          ({filteredProducts.length} matches)
                        </span>
                      )}
                    </>
                  ) : (
                    <>Total products in database: {totalProducts}</>
                  )}
                </div>
                <button
                  onClick={toggleShowAllProducts}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    showAllProducts
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {showAllProducts ? "Hide All Products" : "Show All Products"}
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {(searchTerm || showAllProducts) && (
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    {searchTerm ? (
                      <>
                        Results for:{" "}
                        <span className="text-purple-600">"{searchTerm}"</span>
                      </>
                    ) : (
                      "All Products"
                    )}
                  </h2>
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {filteredProducts.length} found
                  </span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl text-gray-300 mb-2">🔍</div>
                    <p className="text-gray-600">No products found</p>
                    <button
                      onClick={handleClearSearch}
                      className="mt-3 text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar mb-4">
                      {productsToDisplay.map((product, index) => {
                        const currentCurrency = getCurrentCurrency();
                        const productPrice =
                          product.price * currentCurrency.realTimeRate;

                        return (
                          <div
                            key={product.id}
                            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:border-purple-300"
                          >
                            {/* Product Count Badge */}
                            <div className="flex justify-between items-start mb-2">
                              <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                                Count: {product.count}
                              </div>
                              <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                                In Stock
                              </div>
                            </div>

                            {/* Product Name */}
                            <h3 className="font-bold text-gray-800 text-sm mb-2 truncate">
                              {product.BRAND_NAME}
                            </h3>

                            {/* Compact Product Details */}
                            <div className="space-y-1 mb-3">
                              <div>
                                <p className="text-xs text-blue-600 font-medium">
                                  ID:
                                </p>
                                <p className="text-xs text-gray-700 truncate">
                                  {product.id}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-green-600 font-medium">
                                  COMPOSITION:
                                </p>
                                <p className="text-xs text-gray-700 line-clamp-2">
                                  {product.COMPOSITION}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-purple-600 font-medium">
                                  PACKING:
                                </p>
                                <p className="text-xs text-gray-700 truncate">
                                  {product.packing}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-orange-600 font-medium">
                                  PRICE:
                                </p>
                                <p className="text-lg font-bold text-green-600">
                                  {formatCurrency(product.price)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ₹ {product.price} (INR)
                                </p>
                              </div>
                            </div>

                            {/* Direct Quantity Input */}
                            <div className="mb-2">
                              <label className="block text-xs text-gray-600 mb-1">
                                Direct Quantity:
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Qty"
                                  value={directQuantity}
                                  onChange={handleDirectQuantityChange}
                                  className="flex-1 p-1 text-xs border border-gray-300 rounded text-center"
                                />
                                <button
                                  onClick={() =>
                                    addToCartWithQuantity(
                                      product,
                                      directQuantity
                                    )
                                  }
                                  disabled={
                                    !directQuantity ||
                                    parseInt(directQuantity) < 1
                                  }
                                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                  Add
                                </button>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => viewProductDetails(product)}
                                className="flex-1 bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition-all duration-200 font-semibold text-xs"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() =>
                                  addToCartWithQuantity(product, 1)
                                }
                                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-all duration-200 font-semibold text-xs"
                              >
                                Add 1 to Cart
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Load More Button */}
                    {productsToShow < filteredProducts.length && (
                      <div className="text-center mt-4">
                        <button
                          onClick={handleLoadMore}
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-semibold transition-all duration-300"
                        >
                          Load More ({filteredProducts.length - productsToShow}{" "}
                          more products)
                        </button>
                      </div>
                    )}

                    {/* Show All Results Button */}
                    {productsToShow < filteredProducts.length && (
                      <div className="text-center mt-2">
                        <button
                          onClick={() =>
                            setProductsToShow(filteredProducts.length)
                          }
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Show all {filteredProducts.length} results
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Welcome Message */}
            {!searchTerm && !showAllProducts && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 text-center">
                <div className="text-4xl mb-3">💊</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Welcome to Pharma Search
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Start typing in the search bar to find products from{" "}
                  {totalProducts}+ items.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={toggleShowAllProducts}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                  >
                    Browse All Products
                  </button>
                  <button
                    onClick={() => setSearchTerm("Tab")}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                  >
                    Show Tablets
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Cart */}
          <div className="xl:col-span-1">
            {/* Cart Summary Card */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 sticky top-4">
              {/* Cart Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  🛒 Your Cart
                </h2>
                <div className="flex items-center gap-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {cartItemsCount} items
                  </span>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Currency Selector */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-blue-700 mb-2">
                  💱 Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full p-2 border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-500 bg-white text-blue-800 text-xs"
                >
                  {currencyOptions.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-green-600 text-center mt-1 font-medium">
                  1 INR = {conversionRate.toFixed(6)} {selectedCurrency}
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar mb-4">
                {cart.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const currentCurrency = getCurrentCurrency();
                    const itemPrice = item.price * currentCurrency.realTimeRate;

                    return (
                      <div
                        key={item.id}
                        className="bg-gray-50 border border-gray-200 rounded p-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-xs truncate">
                              {item.BRAND_NAME}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatCurrency(item.price)} × {item.quantity}
                            </p>
                            <p className="text-xs text-green-600 font-bold">
                              {formatCurrency(itemPrice * item.quantity)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-5 h-5 bg-red-500 text-white rounded text-xs flex items-center justify-center hover:bg-red-600"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(e) =>
                                  setDirectCartQuantity(item.id, e.target.value)
                                }
                                className="w-10 text-xs border border-gray-300 rounded text-center py-1"
                              />
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-5 h-5 bg-green-500 text-white rounded text-xs flex items-center justify-center hover:bg-green-600"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-full bg-red-500 text-white rounded text-xs py-1 hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Total Display */}
              <div
                className={`p-3 rounded-lg mb-3 ${
                  customPercentage > 0
                    ? "bg-orange-50 border border-orange-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">
                    {customPercentage > 0
                      ? `Total +${customPercentage}%`
                      : "Final Total"}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      customPercentage > 0 ? "text-orange-600" : "text-gray-800"
                    }`}
                  >
                    {formatCurrency(finalTotalINR)}
                  </p>
                  {customPercentage > 0 && (
                    <p className="text-xs text-gray-500 line-through">
                      Before: {formatCurrency(baseTotalINR)}
                    </p>
                  )}
                  <p className="text-xs text-green-600 mt-1">
                    Real-time {selectedCurrency} rate
                  </p>
                </div>
              </div>

              {/* Custom Percentage */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-purple-700 mb-2">
                  Add Percentage (%)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="0"
                    value={percentageInput}
                    onChange={(e) => setPercentageInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && applyCustomPercentage()
                    }
                    className="flex-1 p-2 text-xs border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-300 text-center text-purple-800"
                  />
                  <button
                    onClick={applyCustomPercentage}
                    disabled={
                      !percentageInput || isNaN(parseFloat(percentageInput))
                    }
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-semibold disabled:bg-gray-400"
                  >
                    Apply %
                  </button>
                </div>
                {customPercentage > 0 && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-green-700 font-medium">
                      Current: {customPercentage}%
                    </span>
                    <button
                      onClick={() => setCustomPercentage(0)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove %
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Percentage Buttons */}
              <div className="grid grid-cols-3 gap-1">
                {[5, 10, 15, 20, 25, 50].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setCustomPercentage(percent)}
                    className={`py-1 text-xs font-bold rounded transition-all ${
                      customPercentage === percent
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-gray-300">
            <div className="p-4">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Product Details
                </h2>
                <button
                  onClick={closeProductDetails}
                  className="text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 w-6 h-6 rounded flex items-center justify-center text-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Product Count Display */}
              <div className="bg-blue-500 text-white rounded p-3 mb-4 text-center">
                <p className="font-bold">
                  Product Count: {selectedProduct.count}
                </p>
              </div>

              {/* Product Details */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-blue-600 mb-1">
                    BRAND NAME
                  </p>
                  <p className="text-sm text-gray-800 bg-blue-50 p-2 rounded">
                    {selectedProduct.BRAND_NAME}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-purple-600 mb-1">
                    PRODUCT ID
                  </p>
                  <p className="text-sm text-gray-800 bg-purple-50 p-2 rounded font-mono break-all">
                    {selectedProduct.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-green-600 mb-1">
                    COMPOSITION
                  </p>
                  <p className="text-sm text-gray-800 bg-green-50 p-2 rounded">
                    {selectedProduct.COMPOSITION}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-orange-600 mb-1">
                    PACKING
                  </p>
                  <p className="text-sm text-gray-800 bg-orange-50 p-2 rounded">
                    {selectedProduct.packing}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-red-600 mb-1">
                    PRICE
                  </p>
                  <div className="bg-red-50 p-2 rounded">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedProduct.price)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ₹ {selectedProduct.price} (INR)
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Real-time {selectedCurrency} conversion
                    </p>
                  </div>
                </div>
              </div>

              {/* Remove Button Only */}
              <div className="mt-4">
                <button
                  onClick={closeProductDetails}
                  className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors font-semibold"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProductSearchApp;

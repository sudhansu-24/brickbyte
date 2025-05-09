const validateProperty = (req, res, next) => {
  const { 
    name, 
    location, 
    description, 
    image_url, 
    total_shares, 
    available_shares,
    price_per_share, 
    rental_yield,
    contract_address,
    blockchain_property_id,
    owner_id,
    type
  } = req.body;

  // Required string fields
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Property name is required' });
  }

  if (!location || typeof location !== 'string') {
    return res.status(400).json({ error: 'Property location is required' });
  }

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Property description is required' });
  }

  // Validate property type
  if (!type || typeof type !== 'string' || !['Commercial', 'Residential'].includes(type)) {
    return res.status(400).json({ error: 'Property type must be either Commercial or Residential' });
  }

  // Validate image URL
  if (!image_url || typeof image_url !== 'string') {
    return res.status(400).json({ error: 'Property image URL is required' });
  }

  try {
    new URL(image_url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid image URL format' });
  }

  // Validate contract address
  if (!contract_address || typeof contract_address !== 'string') {
    return res.status(400).json({ error: 'Contract address is required' });
  }

  const contractAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!contractAddressRegex.test(contract_address)) {
    return res.status(400).json({ error: 'Invalid contract address format' });
  }

  // Validate blockchain property ID
  if (!blockchain_property_id || typeof blockchain_property_id !== 'string') {
    return res.status(400).json({ error: 'Blockchain property ID is required' });
  }

  // Validate owner_id
  if (!owner_id || typeof owner_id !== 'string') {
    return res.status(400).json({ error: 'Owner ID is required' });
  }

  // Convert and validate numeric fields
  const totalSharesNum = Number(total_shares);
  if (isNaN(totalSharesNum) || totalSharesNum <= 0) {
    return res.status(400).json({ error: 'Total shares must be a positive number' });
  }

  const availableSharesNum = Number(available_shares);
  if (isNaN(availableSharesNum) || availableSharesNum < 0 || availableSharesNum > totalSharesNum) {
    return res.status(400).json({ error: 'Available shares must be between 0 and total shares' });
  }

  const pricePerShareNum = Number(price_per_share);
  if (isNaN(pricePerShareNum) || pricePerShareNum <= 0) {
    return res.status(400).json({ error: 'Price per share must be a positive number' });
  }

  const rentalYieldNum = Number(rental_yield);
  if (isNaN(rentalYieldNum) || rentalYieldNum < 0 || rentalYieldNum > 100) {
    return res.status(400).json({ error: 'Rental yield must be between 0 and 100' });
  }

  next();
};

const validateAuth = (req, res, next) => {
  const { email, password, walletAddress } = req.body;
  const isRegistration = req.path === '/register';

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  // Only validate wallet address for registration
  if (isRegistration) {
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletAddress || !walletRegex.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Ethereum wallet address' });
    }
  }

  next();
};

module.exports = {
  validateAuth,
  validateProperty
}; 
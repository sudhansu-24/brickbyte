import express from 'express';
import { verifyWalletSignature, getNonce } from '../controllers/walletController';

const router = express.Router();

router.post('/verify', verifyWalletSignature);
router.get('/nonce/:address', getNonce);

export default router;

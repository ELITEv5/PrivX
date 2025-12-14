
# PrivX Plonk ZK Privacy Mixer

Fully functional Plonk-based privacy protocol on PulseChain.

## Deployed Contracts (PulseChain)
- PrivX Token: `0x34310B5d3a8d1e5f8e4A40dcf38E48d90170E986`
- Plonk Verifier: `0xB7253CE4031E72CdEeCF8212334611D64FF69bD7`
- Hasher: `0x30DF8A96d69f0643B876c9FcCDFABdb6aA3402e5`
- Mining Vault V14: `0x6fBd619538948e134b508e8954e120e99f7999a2`
- Hurricane Plonk 100: `0x1746f6fe7447A13B7554fAb9FA0b77A8a5A61821`
- Hurricane Plonk 1000: `0x0F15B28f1B9C9b3c4B7b9d7864ef79BeEBCb37b6`
- Hurricane Plonk 10000: `0x8c17b741695Cb4B7c81F8Bfc20203B47dcd8d285`
- Hurricane Plonk 100000: `0x4b393d5Bef35E225074Ed1f247D147F8c9e904F4`

## Generate Proof (Terminal)

```bash
# 1. Prepare your input.json (see build/input.json example)
# 2. Generate proof
snarkjs plonk fullprove build/input.json circuits/mixer_js/mixer.wasm build/mixer_final.zkey proof.json public.json

# 3. Use proof.json + public.json to withdraw anonymously

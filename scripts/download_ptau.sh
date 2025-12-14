mkdir scripts
cat > scripts/download_ptau.sh << 'EOF'
#!/bin/bash
echo "Downloading powersOfTau28_hez_final_21.ptau (~2.4GB)..."
mkdir -p build
cd build
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_21.ptau
echo "Download complete! Place in build/ folder."
EOF
chmod +x scripts/download_ptau.sh

// High-resolution Canvas renderer for Apple Wallet card art (1536 x 969)

export async function renderCardToCanvas(options) {
  const {
    width = 1536,
    height = 969,
    bgType = 'preset', // 'image' | 'preset' | 'gradient' | 'color'
    bgImage = null,
    bgColor1 = '#1e1b4b',
    bgColor2 = '#4338ca',
    gradientAngle = 135,
    network = 'visa',
    networkPos = 'br', // 'tl', 'tr', 'bl', 'br'
    networkColor = 'color', // 'color', 'white', 'black', 'gold'
    networkScale = 1.0,
    issuerName = 'CARDART PREMIER',
    issuerPos = 'tl',
    showChip = true,
    chipType = 'gold', // 'gold', 'silver'
    showNfc = true,
    cardholderName = 'KENJI TANAKA',
    cardNumber = '•••• 4321',
    expiry = '09/29',
    tier = 'PLATINUM',
    finish = 'sheen', // 'none', 'sheen', 'holo', 'matte'
    finishIntensity = 0.5
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Clip to Apple Wallet card radius (4.8% of width ≈ 74px)
  const radius = width * 0.048;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, radius);
  ctx.clip();

  // 1. Render Background
  if (bgType === 'image' && bgImage) {
    if (typeof bgImage === 'string') {
      const img = await loadImage(bgImage);
      drawImageCover(ctx, img, 0, 0, width, height);
    } else if (bgImage instanceof HTMLImageElement || bgImage instanceof Image) {
      drawImageCover(ctx, bgImage, 0, 0, width, height);
    }
  } else if (bgType === 'gradient') {
    const angleRad = (gradientAngle * Math.PI) / 180;
    const x1 = width / 2 - (Math.cos(angleRad) * width) / 2;
    const y1 = height / 2 - (Math.sin(angleRad) * height) / 2;
    const x2 = width / 2 + (Math.cos(angleRad) * width) / 2;
    const y2 = height / 2 + (Math.sin(angleRad) * height) / 2;
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, bgColor1);
    grad.addColorStop(1, bgColor2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Solid or preset gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, bgColor1);
    grad.addColorStop(1, bgColor2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Overlays & Finishes
  if (finish === 'sheen' || finish === 'holo') {
    const sheenGrad = ctx.createLinearGradient(0, 0, width * 0.9, height * 0.9);
    if (finish === 'holo') {
      sheenGrad.addColorStop(0, 'rgba(255, 180, 200, 0.25)');
      sheenGrad.addColorStop(0.3, 'rgba(180, 255, 220, 0.3)');
      sheenGrad.addColorStop(0.6, 'rgba(180, 220, 255, 0.35)');
      sheenGrad.addColorStop(1, 'rgba(240, 180, 255, 0.25)');
    } else {
      sheenGrad.addColorStop(0, `rgba(255, 255, 255, ${0.4 * finishIntensity})`);
      sheenGrad.addColorStop(0.4, `rgba(255, 255, 255, ${0.1 * finishIntensity})`);
      sheenGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
    }
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (finish === 'matte') {
    // Subtle frosted noise / matte overlay
    ctx.fillStyle = `rgba(255, 255, 255, ${0.08 * finishIntensity})`;
    ctx.fillRect(0, 0, width, height);
  }

  // 3. EMV Smart Chip
  if (showChip) {
    const chipX = width * 0.12;
    const chipY = height * 0.38;
    const chipW = width * 0.12;
    const chipH = chipW * 0.78;
    drawEmvChip(ctx, chipX, chipY, chipW, chipH, chipType);
  }

  // 4. Contactless NFC Wave
  if (showNfc) {
    const nfcX = width * 0.27;
    const nfcY = height * 0.44;
    drawNfcIcon(ctx, nfcX, nfcY, 32);
  }

  // 5. Issuer Bank Name
  if (issuerName) {
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.letterSpacing = '3px';
    
    let ix = width * 0.08;
    let iy = height * 0.14;
    if (issuerPos === 'tr') {
      ix = width * 0.92;
      ctx.textAlign = 'right';
    } else {
      ctx.textAlign = 'left';
    }
    ctx.fillText(issuerName.toUpperCase(), ix, iy);
    ctx.shadowBlur = 0;
  }

  // 6. Tier Badge
  if (tier) {
    ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.letterSpacing = '2px';
    ctx.fillText(tier.toUpperCase(), width * 0.08, height * 0.20);
  }

  // 7. Cardholder Name & Expiry & Number
  ctx.textAlign = 'left';
  if (cardNumber) {
    ctx.font = '500 44px "Courier New", Courier, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText(cardNumber, width * 0.08, height * 0.72);
  }

  if (cardholderName) {
    ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.letterSpacing = '2px';
    ctx.fillText(cardholderName.toUpperCase(), width * 0.08, height * 0.86);
  }

  if (expiry) {
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`VALID THRU ${expiry}`, width * 0.46, height * 0.86);
  }

  // 8. Network Logo
  drawNetworkLogo(ctx, network, networkPos, width, height, networkScale);

  // 9. Refined Inset Edge Border (Apple Wallet signature look)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
  return canvas;
}

function drawEmvChip(ctx, x, y, w, h, type = 'gold') {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, w * 0.14);
  
  // Chip background gradient
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  if (type === 'silver') {
    grad.addColorStop(0, '#f1f5f9');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#94a3b8');
  } else {
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#eab308');
    grad.addColorStop(1, '#ca8a04');
  }
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = type === 'silver' ? '#64748b' : '#854d0e';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Contact cuts
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.38);
  ctx.lineTo(x + w * 0.42, y + h * 0.38);
  ctx.moveTo(x, y + h * 0.62);
  ctx.lineTo(x + w * 0.42, y + h * 0.62);
  
  ctx.moveTo(x + w, y + h * 0.38);
  ctx.lineTo(x + w * 0.58, y + h * 0.38);
  ctx.moveTo(x + w, y + h * 0.62);
  ctx.lineTo(x + w * 0.58, y + h * 0.62);

  ctx.moveTo(x + w * 0.42, y);
  ctx.lineTo(x + w * 0.42, y + h);
  ctx.moveTo(x + w * 0.58, y);
  ctx.lineTo(x + w * 0.58, y + h);

  ctx.strokeStyle = type === 'silver' ? '#475569' : '#713f12';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawNfcIcon(ctx, x, y, size) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(x, y, size * 0.35, -Math.PI * 0.35, Math.PI * 0.35);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, size * 0.65, -Math.PI * 0.35, Math.PI * 0.35);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, size, -Math.PI * 0.35, Math.PI * 0.35);
  ctx.stroke();
  ctx.restore();
}

function drawNetworkLogo(ctx, network, pos, w, h, scale = 1.0) {
  let x = w * 0.82;
  let y = h * 0.84;

  if (pos === 'tr') {
    x = w * 0.82;
    y = h * 0.16;
  } else if (pos === 'tl') {
    x = w * 0.16;
    y = h * 0.16;
  } else if (pos === 'bl') {
    x = w * 0.16;
    y = h * 0.84;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (network === 'mastercard') {
    const r = 36;
    // Left Red Circle
    ctx.beginPath();
    ctx.arc(-22, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#EB001B';
    ctx.fill();

    // Right Amber Circle
    ctx.beginPath();
    ctx.arc(22, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#F79E1B';
    ctx.fill();

    // Intersecting Orange Lens
    ctx.save();
    ctx.beginPath();
    ctx.arc(-22, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(22, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#FF5F00';
    ctx.fill();
    ctx.restore();
  } else if (network === 'visa') {
    ctx.font = 'italic 900 62px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VISA', 0, 0);
  } else if (network === 'amex') {
    ctx.beginPath();
    ctx.roundRect(-55, -28, 110, 56, 6);
    ctx.fillStyle = '#006fcf';
    ctx.fill();
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AMEX', 0, 0);
  } else if (network === 'suica') {
    ctx.beginPath();
    ctx.roundRect(-45, -22, 90, 44, 8);
    ctx.fillStyle = '#008037';
    ctx.fill();
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Suica', 0, 0);
  } else if (network === 'jcb') {
    const barW = 24;
    const barH = 46;
    ctx.beginPath();
    ctx.roundRect(-38, -23, barW, barH, 6);
    ctx.fillStyle = '#0079C1';
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(-12, -23, barW, barH, 6);
    ctx.fillStyle = '#E60012';
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(14, -23, barW, barH, 6);
    ctx.fillStyle = '#00873C';
    ctx.fill();

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('JCB', 0, 0);
  }

  ctx.restore();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  let sWidth, sHeight, sx, sy;

  if (imgRatio > canvasRatio) {
    sHeight = img.height;
    sWidth = img.height * canvasRatio;
    sx = (img.width - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = img.width;
    sHeight = img.width / canvasRatio;
    sx = 0;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

/**
 * Generador del icono icon.ico para Markdown Editor en Windows.
 * Crea un archivo .ico multi-resolución (16x16, 32x32, 48x48, 64x64)
 * en formato DIB 32-bit RGBA sin dependencias externas.
 */

const fs = require('fs');
const path = require('path');

function createIconBuffer(sizes) {
  const images = sizes.map(size => renderIconImage(size));

  // Cabecera ICO: 6 bytes
  // - 2 bytes reservado (0)
  // - 2 bytes tipo (1 = ICO)
  // - 2 bytes número de imágenes
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalDirSize = dirEntrySize * images.length;

  let currentOffset = headerSize + totalDirSize;
  const dirBuffers = [];
  const imageBuffers = [];

  for (const img of images) {
    const dibSize = img.dibBuffer.length;

    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Paleta
    entry.writeUInt8(0, 3); // Reservado
    entry.writeUInt16LE(1, 4); // Planos de color
    entry.writeUInt16LE(32, 6); // Bits por píxel
    entry.writeUInt32LE(dibSize, 8); // Tamaño del recurso DIB
    entry.writeUInt32LE(currentOffset, 12); // Offset en el archivo

    dirBuffers.push(entry);
    imageBuffers.push(img.dibBuffer);
    currentOffset += dibSize;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  return Buffer.concat([header, ...dirBuffers, ...imageBuffers]);
}

function renderIconImage(size) {
  // Crear buffer de píxeles RGBA (size x size)
  // Dibujamos el icono con gradiente azul-índigo y el logo de Markdown 'M'
  const pixels = new Uint8ClampedArray(size * size * 4);

  const radius = size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Comprobar si el punto cae dentro del rectángulo redondeado
      const dx = Math.max(Math.abs(x + 0.5 - cx) - (cx - radius), 0);
      const dy = Math.max(Math.abs(y + 0.5 - cy) - (cy - radius), 0);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) {
        // Fuera de la forma: transparente
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
        continue;
      }

      // Suavizado en el borde
      let alpha = 255;
      if (dist > radius - 1) {
        alpha = Math.round(255 * (radius - dist));
      }

      // Gradiente azul a violeta (#3b82f6 -> #8b5cf6)
      const t = (x + y) / (size * 2);
      let r = Math.round(59 + (139 - 59) * t);
      let g = Math.round(130 + (92 - 130) * t);
      let b = Math.round(246 + (246 - 246) * t);

      // Brillo superior sutil
      if (y < size * 0.45) {
        const shine = (1 - (y / (size * 0.45))) * 0.25;
        r = Math.min(255, Math.round(r + (255 - r) * shine));
        g = Math.min(255, Math.round(g + (255 - g) * shine));
        b = Math.min(255, Math.round(b + (255 - b) * shine));
      }

      // Dibujar la 'M' de Markdown en blanco
      const nx = x / size;
      const ny = y / size;

      // Margen de la letra M: centrado
      const mLeft = 0.26;
      const mRight = 0.74;
      const mTop = 0.30;
      const mBottom = 0.68;
      const stroke = Math.max(1.2 / size, 0.075);

      let inM = false;

      // Columna izquierda de la M
      if (nx >= mLeft && nx <= mLeft + stroke && ny >= mTop && ny <= mBottom) {
        inM = true;
      }
      // Columna derecha de la M
      if (nx >= mRight - stroke && nx <= mRight && ny >= mTop && ny <= mBottom) {
        inM = true;
      }
      // Diagonal izquierda descendente
      const diag1Dist = Math.abs((ny - mTop) - ((mBottom - 0.12 - mTop) / (0.5 - mLeft)) * (nx - mLeft));
      if (nx >= mLeft && nx <= 0.5 && ny >= mTop && ny <= mBottom - 0.05 && diag1Dist < stroke * 0.9) {
        inM = true;
      }
      // Diagonal derecha ascendente
      const diag2Dist = Math.abs((ny - mTop) - ((mBottom - 0.12 - mTop) / (0.5 - mRight)) * (nx - mRight));
      if (nx >= 0.5 && nx <= mRight && ny >= mTop && ny <= mBottom - 0.05 && diag2Dist < stroke * 0.9) {
        inM = true;
      }

      // Barra inferior decorativa estilo Markdown
      if (ny >= 0.74 && ny <= 0.80 && nx >= 0.32 && nx <= 0.68) {
        inM = true;
      }

      if (inM) {
        r = 255;
        g = 255;
        b = 255;
      }

      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = alpha;
    }
  }

  // Convertir a formato DIB (Windows BMP dentro de ICO):
  // BITMAPINFOHEADER (40 bytes) + Píxeles en BGRA de abajo a arriba + Máscara AND (1 bit por píxel)
  const headerSize = 40;
  const xorSize = size * size * 4;
  const andRowBytes = Math.ceil(size / 32) * 4; // Múltiplo de 4 bytes
  const andSize = andRowBytes * size;
  const dibBuffer = Buffer.alloc(headerSize + xorSize + andSize);

  // BITMAPINFOHEADER
  dibBuffer.writeUInt32LE(40, 0); // biSize
  dibBuffer.writeInt32LE(size, 4); // biWidth
  dibBuffer.writeInt32LE(size * 2, 8); // biHeight (XOR + AND)
  dibBuffer.writeUInt16LE(1, 12); // biPlanes
  dibBuffer.writeUInt16LE(32, 14); // biBitCount
  dibBuffer.writeUInt32LE(0, 16); // biCompression (BI_RGB)
  dibBuffer.writeUInt32LE(xorSize + andSize, 20); // biSizeImage
  dibBuffer.writeInt32LE(0, 24); // biXPelsPerMeter
  dibBuffer.writeInt32LE(0, 28); // biYPelsPerMeter
  dibBuffer.writeUInt32LE(0, 32); // biClrUsed
  dibBuffer.writeUInt32LE(0, 36); // biClrImportant

  // Escribir píxeles XOR (BGRA) invertidos verticalmente
  let offset = headerSize;
  for (let y = size - 1; y >= 0; y--) {
    for (let x = 0; x < size; x++) {
      const srcIdx = (y * size + x) * 4;
      const r = pixels[srcIdx];
      const g = pixels[srcIdx + 1];
      const b = pixels[srcIdx + 2];
      const a = pixels[srcIdx + 3];

      dibBuffer.writeUInt8(b, offset);
      dibBuffer.writeUInt8(g, offset + 1);
      dibBuffer.writeUInt8(r, offset + 2);
      dibBuffer.writeUInt8(a, offset + 3);
      offset += 4;
    }
  }

  // Escribir máscara AND (1 = transparente, 0 = visible) invertida verticalmente
  for (let y = size - 1; y >= 0; y--) {
    let rowByte = 0;
    let bitCount = 0;
    let rowStart = offset;

    for (let x = 0; x < size; x++) {
      const srcIdx = (y * size + x) * 4;
      const a = pixels[srcIdx + 3];
      const isTransparent = a === 0 ? 1 : 0;

      rowByte = (rowByte << 1) | isTransparent;
      bitCount++;

      if (bitCount === 8) {
        dibBuffer.writeUInt8(rowByte, offset++);
        rowByte = 0;
        bitCount = 0;
      }
    }

    if (bitCount > 0) {
      rowByte <<= (8 - bitCount);
      dibBuffer.writeUInt8(rowByte, offset++);
    }

    // Rellenar hasta múltiplo de 4 bytes
    const writtenInRow = offset - rowStart;
    for (let pad = writtenInRow; pad < andRowBytes; pad++) {
      dibBuffer.writeUInt8(0, offset++);
    }
  }

  return { width: size, height: size, dibBuffer };
}

const outputPath = path.join(__dirname, 'icon.ico');
const icoData = createIconBuffer([16, 32, 48, 64]);
fs.writeFileSync(outputPath, icoData);
console.log('✅ Archivo icon.ico generado correctamente en:', outputPath);

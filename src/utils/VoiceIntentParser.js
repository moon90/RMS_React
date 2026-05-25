class VoiceIntentParser {
  parseIntent(transcript) {
    const text = transcript.toLowerCase().trim();

    // 1. ADD Command
    // Example: "add two burgers", "add chicken sandwich"
    const addMatch = text.match(/add\s+(?:(\w+)\s+)?(.+)/);
    if (addMatch) {
      const quantityStr = addMatch[1];
      const productName = addMatch[2];
      const quantity = this.parseQuantity(quantityStr) || 1;
      return { action: 'ADD_TO_CART', productName, quantity };
    }

    // 2. REMOVE Command
    // Example: "remove burger"
    const removeMatch = text.match(/remove\s+(.+)/);
    if (removeMatch) {
      return { action: 'REMOVE_FROM_CART', productName: removeMatch[1] };
    }

    // 3. CHECKOUT Command
    // Example: "checkout", "pay", "process payment"
    if (text.includes('checkout') || text.includes('pay') || text.includes('process payment')) {
      return { action: 'OPEN_CHECKOUT' };
    }

    // 4. CLEAR Command
    if (text.includes('clear cart') || text.includes('empty cart')) {
      return { action: 'CLEAR_CART' };
    }

    return { action: 'UNKNOWN', transcript };
  }

  parseQuantity(str) {
    if (!str) return null;
    const numberMap = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };
    if (numberMap[str]) return numberMap[str];
    const num = parseInt(str);
    return isNaN(num) ? null : num;
  }
}

export default new VoiceIntentParser();

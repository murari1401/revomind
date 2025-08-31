const API = {
  async generateImage(idea) {
    try {
      const response = await fetch('/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getSuggestions(idea) {
    try {
      const response = await fetch('/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.suggestions;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getTrending() {
    try {
      const response = await fetch('/trending');
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.ideas;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};
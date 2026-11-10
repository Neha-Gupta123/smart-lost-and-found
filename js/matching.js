/**
 * Smart Missing Items Finder AI - Rule-Based Matching Engine
 * Day 3: Heuristic Multi-Attribute Comparison, Semantic Clustering & Similarity Scoring
 */

(function (window) {
  'use strict';

  // Common stop words to exclude when analyzing natural language similarity
  const STOP_WORDS = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'up', 'about', 'into', 'over', 'after', 'and', 'or', 'but', 'is', 'are', 'was',
    'were', 'it', 'my', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
    'we', 'they', 'item', 'lost', 'found', 'please', 'help', 'has', 'have', 'had',
    'near', 'next', 'side', 'front', 'back', 'top', 'bottom', 'left', 'right',
    'not', 'specified', 'unknown', 'na', 'n/a', 'none'
  ]);

  // Semantic Concept Clusters for intelligent synonym matching
  const SYNONYM_CLUSTERS = [
    { name: 'Smartphone / Mobile', tokens: ['phone', 'smartphone', 'mobile', 'iphone', 'android', 'cellphone', 'cell'] },
    { name: 'Earphones / Audio', tokens: ['earphones', 'earbuds', 'headphones', 'airpods', 'airpod', 'headset', 'earphone', 'earbud', 'headphone'] },
    { name: 'Laptop / Computer', tokens: ['laptop', 'notebook', 'macbook', 'chromebook', 'computer', 'pc'] },
    { name: 'Tablet / iPad', tokens: ['tablet', 'ipad', 'kindle', 'tab'] },
    { name: 'Wallet / Purse', tokens: ['wallet', 'purse', 'billfold', 'clutch', 'pouch', 'cardholder'] },
    { name: 'Bag / Backpack', tokens: ['bag', 'backpack', 'rucksack', 'knapsack', 'tote', 'duffel', 'satchel', 'briefcase', 'handbag'] },
    { name: 'Keys / Access', tokens: ['key', 'keys', 'keychain', 'keyring', 'fob', 'carabiner'] },
    { name: 'Watch / Smartwatch', tokens: ['watch', 'smartwatch', 'iwatch', 'timepiece', 'fitbit', 'band'] },
    { name: 'Glasses / Eyewear', tokens: ['glasses', 'sunglasses', 'spectacles', 'shades', 'eyewear', 'specs', 'frames'] },
    { name: 'Bottle / Flask', tokens: ['bottle', 'flask', 'tumbler', 'thermos', 'mug', 'cup'] },
    { name: 'ID / Documents', tokens: ['id', 'card', 'badge', 'license', 'passport', 'pass', 'document'] },
    { name: 'Charger / Cable', tokens: ['charger', 'cable', 'adapter', 'cord', 'wire', 'plug'] },
    { name: 'Umbrella', tokens: ['umbrella', 'parasol'] },
    { name: 'Jacket / Outerwear', tokens: ['jacket', 'coat', 'hoodie', 'sweater', 'blazer', 'parka', 'fleece'] }
  ];

  // Colour palette for keyword extraction
  const COLOUR_PALETTE = [
    'black', 'white', 'silver', 'grey', 'gray', 'blue', 'navy', 'red', 'green',
    'yellow', 'brown', 'gold', 'golden', 'pink', 'purple', 'orange', 'beige',
    'maroon', 'teal', 'cyan', 'rose'
  ];

  /**
   * Safely tokenizes text into lowercase normalized words.
   * @param {*} text
   * @returns {Array<string>}
   */
  function tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .map(t => t.trim())
      .filter(t => t.length > 1 && !STOP_WORDS.has(t));
  }

  /**
   * Returns common unique tokens between two arrays.
   * @param {Array<string>} arr1
   * @param {Array<string>} arr2
   * @returns {Array<string>}
   */
  function tokenIntersection(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return [];
    const set2 = new Set(arr2);
    const common = new Set();
    arr1.forEach(item => {
      if (set2.has(item)) common.add(item);
    });
    return Array.from(common);
  }

  /**
   * Extracts recognized colour terms from a string.
   * @param {*} text
   * @returns {Array<string>}
   */
  function extractColours(text) {
    if (!text || typeof text !== 'string') return [];
    const lower = text.toLowerCase();
    return COLOUR_PALETTE.filter(color => {
      const regex = new RegExp('\\b' + color + '\\b', 'i');
      return regex.test(lower);
    });
  }

  /**
   * Checks if two sets of tokens share a semantic synonym cluster.
   * @param {Array<string>} tokens1
   * @param {Array<string>} tokens2
   * @returns {string|null} Cluster name if matched
   */
  function findSynonymClusterMatch(tokens1, tokens2) {
    if (!Array.isArray(tokens1) || !Array.isArray(tokens2)) return null;
    for (let i = 0; i < SYNONYM_CLUSTERS.length; i++) {
      const cluster = SYNONYM_CLUSTERS[i];
      const match1 = tokens1.some(t => cluster.tokens.includes(t));
      const match2 = tokens2.some(t => cluster.tokens.includes(t));
      if (match1 && match2) {
        return cluster.name;
      }
    }
    return null;
  }

  const MatchingEngine = {
    /**
     * Compare a missing item report with a found item report.
     * Generates a rule-based score (0-98%) and an array of human-readable explanations.
     * @param {Object} missing Missing item object
     * @param {Object} found Found item object
     * @returns {Object} Score, confidence rating, and matching explanations
     */
    compareItems: function (missing, found) {
      if (!missing || !found || typeof missing !== 'object' || typeof found !== 'object') {
        return { score: 0, confidenceLabel: 'No Match', confidenceClass: 'match-none', reasons: [] };
      }

      let score = 0;
      const reasons = [];

      // -----------------------------------------------------------------------
      // 1. Category Matching (Weight: up to 25 points)
      // -----------------------------------------------------------------------
      const missingCat = String(missing.category || '').toLowerCase().trim();
      const foundCat = String(found.category || '').toLowerCase().trim();

      if (missingCat && foundCat) {
        if (missingCat === foundCat) {
          score += 25;
          reasons.push(`Category match: "${missing.category}" (+25%)`);
        } else if (missingCat === 'other' || foundCat === 'other') {
          score += 8;
          reasons.push(`General category overlap with "Other" (+8%)`);
        } else {
          // Clear mismatch across distinct categories (e.g., Electronics vs Clothing)
          score -= 15;
          reasons.push(`Category difference: "${missing.category}" vs "${found.category}" (-15%)`);
        }
      }

      // -----------------------------------------------------------------------
      // 2. Item Name & Semantic Keywords (Weight: up to 30 points)
      // -----------------------------------------------------------------------
      const missingName = String(missing.name || '').toLowerCase().trim();
      const foundName = String(found.name || '').toLowerCase().trim();

      if (missingName && foundName) {
        if (missingName === foundName) {
          score += 30;
          reasons.push(`Exact item title match: "${missing.name}" (+30%)`);
        } else {
          const missingNameTokens = tokenize(missingName);
          const foundNameTokens = tokenize(foundName);
          const commonNameTokens = tokenIntersection(missingNameTokens, foundNameTokens);

          if (commonNameTokens.length > 0) {
            const overlapRatio = commonNameTokens.length / Math.max(missingNameTokens.length, foundNameTokens.length);
            const tokenScore = Math.min(26, Math.max(14, Math.round(overlapRatio * 28)));
            score += tokenScore;
            reasons.push(`Key name terms overlap: "${commonNameTokens.join(', ')}" (+${tokenScore}%)`);
          } else if (missingName.includes(foundName) || foundName.includes(missingName)) {
            score += 18;
            reasons.push(`Item name contains matching phrase (+18%)`);
          } else {
            // Check semantic synonym concept match
            const clusterMatch = findSynonymClusterMatch(missingNameTokens, foundNameTokens);
            if (clusterMatch) {
              score += 18;
              reasons.push(`Semantic concept correlation: both relate to ${clusterMatch} (+18%)`);
            }
          }
        }
      }

      // -----------------------------------------------------------------------
      // 3. Brand / Model Correlation (Weight: up to 15 points, or -15% if conflicting)
      // -----------------------------------------------------------------------
      const missingBrand = String(missing.brand || '').toLowerCase().trim();
      const foundBrand = String(found.brand || '').toLowerCase().trim();
      const isBrandMissingValid = missingBrand && missingBrand !== 'not specified' && missingBrand !== 'unknown' && missingBrand !== 'none';
      const isBrandFoundValid = foundBrand && foundBrand !== 'not specified' && foundBrand !== 'unknown' && foundBrand !== 'none';

      if (isBrandMissingValid && isBrandFoundValid) {
        if (missingBrand === foundBrand) {
          score += 15;
          reasons.push(`Brand / Model match: "${missing.brand}" (+15%)`);
        } else if (missingBrand.includes(foundBrand) || foundBrand.includes(missingBrand)) {
          score += 10;
          reasons.push(`Brand mention overlap: "${missing.brand || found.brand}" (+10%)`);
        } else {
          // Different explicit brands specified (e.g. Apple vs Dell)
          score -= 15;
          reasons.push(`Different brands specified: "${missing.brand}" vs "${found.brand}" (-15%)`);
        }
      } else if (isBrandMissingValid) {
        const foundFullText = (String(found.name || '') + ' ' + String(found.description || '')).toLowerCase();
        if (foundFullText.includes(missingBrand)) {
          score += 10;
          reasons.push(`Brand "${missing.brand}" mentioned in found report details (+10%)`);
        }
      } else if (isBrandFoundValid) {
        const missingFullText = (String(missing.name || '') + ' ' + String(missing.description || '')).toLowerCase();
        if (missingFullText.includes(foundBrand)) {
          score += 10;
          reasons.push(`Brand "${found.brand}" mentioned in missing report details (+10%)`);
        }
      }

      // -----------------------------------------------------------------------
      // 4. Colour Matching (Weight: up to 12 points)
      // -----------------------------------------------------------------------
      const missingColourText = (String(missing.colour || '') + ' ' + String(missing.name || '') + ' ' + String(missing.description || '')).toLowerCase();
      const foundColourText = (String(found.colour || '') + ' ' + String(found.name || '') + ' ' + String(found.description || '')).toLowerCase();

      const missingColours = extractColours(missingColourText);
      const foundColours = extractColours(foundColourText);
      const commonColours = tokenIntersection(missingColours, foundColours);

      if (commonColours.length > 0) {
        score += 12;
        reasons.push(`Colour match: "${commonColours.join(', ')}" (+12%)`);
      }

      // -----------------------------------------------------------------------
      // 5. Organization / Institution Match (Weight: up to 12 points, or -10% if conflicting)
      // -----------------------------------------------------------------------
      const missingOrg = String(missing.organization || '').toLowerCase().trim();
      const foundOrg = String(found.organization || '').toLowerCase().trim();
      const isOrgMissingValid = missingOrg && missingOrg !== 'not specified' && missingOrg !== 'unknown';
      const isOrgFoundValid = foundOrg && foundOrg !== 'not specified' && foundOrg !== 'unknown';

      if (isOrgMissingValid && isOrgFoundValid) {
        if (missingOrg === foundOrg) {
          score += 12;
          reasons.push(`Same organization / facility: "${missing.organization}" (+12%)`);
        } else {
          const orgTokens1 = tokenize(missingOrg);
          const orgTokens2 = tokenize(foundOrg);
          const commonOrg = tokenIntersection(orgTokens1, orgTokens2);
          if (commonOrg.length > 0) {
            score += 8;
            reasons.push(`Common facility keyword: "${commonOrg.join(', ')}" (+8%)`);
          } else {
            // Disparate organizations reported
            score -= 10;
            reasons.push(`Different facility reported: "${missing.organization}" vs "${found.organization}" (-10%)`);
          }
        }
      }

      // -----------------------------------------------------------------------
      // 6. Specific Location Proximity (Weight: up to 10 points)
      // -----------------------------------------------------------------------
      const missingLoc = String(missing.location || '').toLowerCase().trim();
      const foundLoc = String(found.location || '').toLowerCase().trim();

      if (missingLoc && foundLoc) {
        if (missingLoc === foundLoc) {
          score += 10;
          reasons.push(`Exact location match: "${missing.location}" (+10%)`);
        } else {
          const locTokens1 = tokenize(missingLoc);
          const locTokens2 = tokenize(foundLoc);
          const commonLoc = tokenIntersection(locTokens1, locTokens2);
          if (commonLoc.length > 0) {
            score += 7;
            reasons.push(`Nearby location keywords: "${commonLoc.join(', ')}" (+7%)`);
          }
        }
      }

      // -----------------------------------------------------------------------
      // 7. Description Attribute Overlap (Weight: up to 8 points)
      // -----------------------------------------------------------------------
      const missingDescTokens = tokenize(String(missing.description || ''));
      const foundDescTokens = tokenize(String(found.description || ''));
      const commonDescTokens = tokenIntersection(missingDescTokens, foundDescTokens).filter(
        token => !commonColours.includes(token)
      );

      if (commonDescTokens.length > 0) {
        const descBonus = Math.min(8, commonDescTokens.length * 3);
        score += descBonus;
        reasons.push(`Matching descriptive keywords: "${commonDescTokens.slice(0, 3).join(', ')}" (+${descBonus}%)`);
      }

      // -----------------------------------------------------------------------
      // 8. Timeline & Date Plausibility Check (Adjust +4 to -10 points)
      // -----------------------------------------------------------------------
      if (missing.date && found.date) {
        const dLost = new Date(missing.date);
        const dFound = new Date(found.date);
        if (!isNaN(dLost.getTime()) && !isNaN(dFound.getTime())) {
          const dayDiff = Math.round((dFound - dLost) / (1000 * 60 * 60 * 24));
          if (dayDiff >= -1 && dayDiff <= 30) {
            score += 4;
            const diffText = dayDiff === 0 ? 'on the same day' : dayDiff > 0 ? `${dayDiff} day(s) after lost report` : 'within 24h window';
            reasons.push(`Plausible timeline: found ${diffText} (+4%)`);
          } else if (dayDiff < -7) {
            score -= 10;
            reasons.push(`Timeline discrepancy: found date is earlier than lost date (-10%)`);
          }
        }
      }

      // -----------------------------------------------------------------------
      // 9. Score Clamping & Classification
      // -----------------------------------------------------------------------
      // Clamped between 0% and 98% (never 100% to reflect that scores are heuristic estimates)
      score = Math.max(0, Math.min(98, score));

      let confidenceLabel = 'Possible Match';
      let confidenceClass = 'match-low';

      if (score >= 70) {
        confidenceLabel = 'High Match Estimate';
        confidenceClass = 'match-high';
      } else if (score >= 45) {
        confidenceLabel = 'Moderate Match Estimate';
        confidenceClass = 'match-medium';
      } else {
        confidenceLabel = 'Low Match Estimate';
        confidenceClass = 'match-low';
      }

      return {
        score,
        confidenceLabel,
        confidenceClass,
        reasons
      };
    },

    /**
     * Finds and ranks all possible matches between missing reports and found reports.
     * @param {Array<Object>} reports List of all saved reports
     * @param {number} minScore Minimum threshold (default 25%)
     * @returns {Array<Object>} Ranked match comparisons
     */
    findAllMatches: function (reports, minScore = 25) {
      if (!Array.isArray(reports) || reports.length < 2) {
        return [];
      }

      const missingItems = reports.filter(item => item && item.type === 'missing');
      const foundItems = reports.filter(item => item && item.type === 'found');

      if (missingItems.length === 0 || foundItems.length === 0) {
        return [];
      }

      const matches = [];

      missingItems.forEach(missing => {
        foundItems.forEach(found => {
          const result = this.compareItems(missing, found);
          if (result.score >= minScore) {
            matches.push({
              id: `match_${missing.id}_${found.id}`,
              missingItem: missing,
              foundItem: found,
              score: result.score,
              confidenceLabel: result.confidenceLabel,
              confidenceClass: result.confidenceClass,
              reasons: result.reasons
            });
          }
        });
      });

      // Sort descending by estimated match score
      matches.sort((a, b) => b.score - a.score);

      return matches;
    }
  };

  window.MatchingEngine = MatchingEngine;
})(window);

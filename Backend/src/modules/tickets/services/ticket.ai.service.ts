// src/modules/tickets/services/ticket.ai.service.ts
import { CreateTicketDto } from '../dto';
import { Agency, Category, RoutingRule } from '@prisma/client';
import { logger } from '@/config/logger.config';
import { generativeModel } from '@/config/gemini'; // When you implement actual Gemini

interface TicketAiContext {
  categories: Pick<Category, 'id' | 'name' | 'description'>[];
  agencies: Pick<Agency, 'id' | 'name' | 'description'>[];
  // Provide routing rules as context so AI understands existing explicit mappings
  routingRules: { categoryName: string | undefined; agencyName: string | undefined }[];
}

export class TicketAiService {
  /**
   * Placeholder for AI-based agency suggestion.
   * In a real implementation, this would call an AI model (e.g., Gemini).
   * @param ticketDto - The details of the ticket being created.
   * @param context - Contextual information like available categories, agencies, and routing rules.
   * @returns A suggested agencyId or null if no suggestion.
   */
  async suggestAgencyForTicket(
    ticketDto: { title: string; detailedDescription: string; categoryName?: string },
    context: TicketAiContext
  ): Promise<string | null> {
    logger.info('[AI Service] Attempting to suggest agency for ticket.', { ticketDetails: ticketDto.title });

    // --- SIMULATED AI LOGIC ---
    // This is a very basic placeholder. A real AI would use NLP on description/title
    // and knowledge from the provided context.

    if (ticketDto.categoryName) {
      // If a category is provided, AI might try to find the best match based on description
      // or confirm if the explicit routing for this category is appropriate.
      logger.info(`[AI Service] Category "${ticketDto.categoryName}" was provided. AI would analyze context.`);

      // Example: If AI finds a keyword related to an agency in description
      if (ticketDto.detailedDescription.toLowerCase().includes("transport") && context.agencies.find(a => a.name.toLowerCase().includes("transport"))) {
        const transportAgency = context.agencies.find(a => a.name.toLowerCase().includes("transport"));
        logger.info(`[AI Service] Placeholder: Found "transport" keyword. Suggesting agency: ${transportAgency?.name}`);
        return transportAgency ? transportAgency.id : null;
      }
    } else {
      // If no category, AI would rely heavily on title/description against agency responsibilities
      logger.info('[AI Service] No category provided. AI would analyze title/description.');
       if (ticketDto.detailedDescription.toLowerCase().includes("water") && context.agencies.find(a => a.name.toLowerCase().includes("water"))) {
        const waterAgency = context.agencies.find(a => a.name.toLowerCase().includes("water"));
        logger.info(`[AI Service] Placeholder: Found "water" keyword. Suggesting agency: ${waterAgency?.name}`);
        return waterAgency ? waterAgency.id : null;
      }
    }

    // --- Real AI Call (Example using Gemini - to be implemented) ---
    
    try {
      const prompt = `
        You are an expert router. obey rules strictly.
        Given the following ticket details:
        Title: "${ticketDto.title}"
        Description: "${ticketDto.detailedDescription}"
        ${ticketDto.categoryName ? `Provided Category: "${ticketDto.categoryName}"` : ''}

        Note: ticket can be in another language expecial kinyarwanda or french. first check if it is not in english and translate it to english to capture the context better(If ticket language ≠ English, translate internally before reasoning.). 

        And the following context about our governmant services:
        Agencies: ${JSON.stringify(context.agencies.map(a => ({ name: a.name, description: a.description, id: a.id })))}
        Categories: ${JSON.stringify(context.categories.map(c => ({ name: c.name, description: c.description, id: c.id })))}
        Existing Routing Rules (Category to Agency): ${JSON.stringify(context.routingRules)}

        Suggest the most appropriate agency ID to handle this ticket.
        If a category was provided, consider if the existing routing for it is best, or if based on the description, another agency is more suitable.
        If no category was provided, suggest an agency based on the title and description.
        Only return the agency ID string (e.g., "clxyz123...") or "null" if no specific agency can be confidently suggested.
      `;

      const result = await generativeModel.generateContent(prompt);
      
      const responseText = result.response.text().trim();

      logger.info('[AI Service] Gemini response:', { responseText });

      if (responseText && responseText !== "null" && context.agencies.find(a => a.id === responseText)) {
        return responseText; // Validate if the ID is one of the known agency IDs
      }
      return null;
    } catch (error) {
      console.log(error)
      logger.error('[AI Service] Error calling Gemini API:', error);
      return null; // Fallback if AI fails
    }
    

    logger.info('[AI Service] Placeholder: No specific AI suggestion made.');
    return null; // Placeholder: No suggestion
  }
}
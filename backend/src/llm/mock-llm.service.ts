import { Injectable, Logger } from '@nestjs/common';
import { ChatMessage, CompletionOptions, StreamCallbacks } from './llm.interface';

@Injectable()
export class MockLlmService {
  private readonly logger = new Logger(MockLlmService.name);

  async generateCompletion(
    messages: ChatMessage[],
    options: CompletionOptions = {},
  ): Promise<string> {
    const isJudge = messages.some(
      (m) =>
        m.role === 'system' &&
        (m.content.includes('impartial debate judge') || m.content.includes('Judge')),
    );

    if (isJudge || options.responseFormatJson) {
      return this.generateMockJudgeResponse(messages);
    }

    return this.generateMockDebaterResponse(messages);
  }

  async streamCompletion(
    messages: ChatMessage[],
    callbacks: StreamCallbacks,
    options: CompletionOptions = {},
  ): Promise<string> {
    const fullText = await this.generateCompletion(messages, options);

    // Split into natural chunks of words
    const words = fullText.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      currentText += chunk;
      callbacks.onChunk(chunk);
      // Small simulated streaming delay
      await new Promise((resolve) => setTimeout(resolve, 35));
    }

    if (callbacks.onComplete) {
      callbacks.onComplete(fullText);
    }

    return fullText;
  }

  private generateMockDebaterResponse(messages: ChatMessage[]): string {
    const systemPrompt = messages.find((m) => m.role === 'system')?.content || '';
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const isDebaterA = systemPrompt.includes('Debater A') || systemPrompt.includes('FOR') || systemPrompt.includes('पक्ष');
    const isHindi = systemPrompt.toLowerCase().includes('hindi') || systemPrompt.includes('हिन्दी') || lastUserMsg.includes('हिन्दी');

    // Extract topic if present in user prompt
    const topicMatch = lastUserMsg.match(/Topic:\s*"([^"]+)"/i) || lastUserMsg.match(/Topic:\s*(.+)/i) || lastUserMsg.match(/"([^"]+)"/i);
    const topic = topicMatch ? topicMatch[1].trim() : 'विषय';

    const isOpening = messages.length <= 2;
    const isClosing = lastUserMsg.includes('final') || lastUserMsg.includes('closing') || lastUserMsg.includes('Concluding') || lastUserMsg.includes('अंतिम');

    if (isHindi) {
      if (isDebaterA) {
        if (isOpening) {
          return `मैं विषय "${topic}" के पक्ष में अपना दृढ़ मत प्रस्तुत करता हूँ। 

इस प्रस्ताव के समर्थन में तीन मुख्य तार्किक स्तंभ हैं:
1. **तीव्र तकनीकी प्रगति और क्षमता**: ऐतिहासिक रूप से हर बड़े तकनीकी बदलाव ने दक्षता की नई परिभाषा गढ़ी है। यह परिवर्तन केवल मौजूदा काम को आसान नहीं बनाता, बल्कि नई संभावनाओं के द्वार खोलता है।
2. **उत्पादकता और वैश्विक पहुंच**: इस व्यवस्था से मानवीय त्रुटियों में भारी कमी आती है और संसाधनों का अधिकतम सदुपयोग संभव होता है।
3. **भविष्य की अनिवार्य दिशा**: नवाचार को नकारना समय की गति को रोकने जैसा है।

अतः, सकारात्मक दृष्टिकोण अपनाना केवल तार्किक ही नहीं बल्कि व्यावहारिक आवश्यकता भी है।`;
        } else if (isClosing) {
          return `अपने अंतिम वक्तव्य में, मैं निर्णायक महोदय का ध्यान इस बहस के केंद्रीय सत्य की ओर आकर्षित करना चाहता हूँ।

विपक्ष ने केवल काल्पनिक जोखिमों और संक्रमणकालीन कठिनाइयों पर बल दिया है, लेकिन हमारे मुख्य तर्कों का कोई ठोस विकल्प प्रस्तुत नहीं किया।

निष्कर्षतः:
• सकारात्मक दृष्टिकोण प्रगति और उत्पादकता को गति देता है।
• साक्ष्य यह सिद्ध करते हैं कि इस बदलाव से समग्र समाज को दीर्घकालिक लाभ होगा।

इसलिए, मैं निर्णायक महोदय से पक्ष में निर्णय देने का विनम्र अनुरोध करता हूँ।`;
        } else {
          return `मेरे विद्वान विपक्षी साथी का तर्क सुनने में आकर्षक है, लेकिन इसमें मूलभूत तार्किक विरोधाभास है।

आप यह मान रहे हैं कि वर्तमान चुनौतियाँ स्थायी रहेंगी, जबकि वास्तविकता यह है कि आधुनिक सुरक्षा तंत्र और तकनीकें लगातार परिपक्व हो रही हैं:
• **गलत दुविधा (False Dilemma)**: आप स्थिरता और प्रगति के बीच एक काल्पनिक टकराव खड़ा कर रहे हैं।
• **व्यावहारिक आंकड़े**: हाल के परिणाम स्पष्ट करते हैं कि दक्षता में निरंतर वृद्धि हो रही है।

हम पुरानी मान्यताओं के आधार पर भविष्य के सकारात्मक प्रभाव को खारिज नहीं कर सकते।`;
        }
      } else {
        // Debater B (AGAINST - Hindi)
        if (isOpening) {
          return `मैं विषय "${topic}" के विपक्ष में अपना स्पष्ट एवं तार्किक विरोध दर्ज करता हूँ।

विरोधी पक्ष का दृष्टिकोण अत्यधिक आशावादी और वास्तविक जटिलताओं से दूर है:
1. **अति-सरलीकरण का भ्रम**: जटिल मानव-केंद्रित प्रणालियों को केवल स्वचालित नियमों में बांधना असंभव है। हर निर्णय में संदर्भ, नैतिकता और अनुभव की आवश्यकता होती है।
2. **जवाबदेही और सुरक्षा जोखिम**: बिना ठोस सत्यापन ढांचे के जल्दबाजी में उठाया गया कदम गंभीर व्यवस्थागत जोखिम पैदा कर सकता है।
3. **गहन मानवीय समझ की अपरिहार्यता**: संवेदनशील परिस्थितियों में मानवीय विवेक और अंतर्दृष्टि का कोई विकल्प नहीं हो सकता।

अतः, इस प्रस्ताव को इसके वर्तमान रूप में स्वीकार करना विवेकपूर्ण नहीं है।`;
        } else if (isClosing) {
          return `समापन में, यह वाद-विवाद स्पष्ट करता है कि काल्पनिक प्रचार और धरातलीय यथार्थ में कितना बड़ा अंतर है।

एजेंट A ने मुख्य व्यावहारिक जोखिमों, जवाबदेही की कमी और सूक्ष्म जटिलताओं का कोई संतोषजनक उत्तर नहीं दिया।

हमारा सुदृढ़ निष्कर्ष:
• बिना पूर्ण सुरक्षा और विश्वसनीयता के किसी भी व्यवस्था को अंधाधुंध लागू करना विनाशकारी हो सकता है।
• संतुलित और सतर्क दृष्टिकोण ही दीर्घकालिक सफलता की कुंजी है।

अतः विपक्ष का दृष्टिकोण ही तार्किक रूप से विजय का हकदार है।`;
        } else {
          return `एजेंट A ने अपने खंडन में मूल संकट से ध्यान भटकाने का प्रयास किया है।

वे आधुनिक सुरक्षा का दावा तो करते हैं, लेकिन गंभीर विफलताओं के समय जवाबदेही किसकी होगी, इसका कोई समाधान नहीं देते:
• **सत्यापन का संकट**: जैसे-जैसे जटिलता बढ़ती है, गलतियों की पहचान करना कठिन और महंगा हो जाता है।
• **नैतिक व प्रासंगिक सीमाएं**: अमूर्त मॉडल कभी भी स्थानीय संदर्भ और मानवीय बारीकियों को नहीं समझ सकते।

अतः, केवल आशावाद के आधार पर इतने बड़े बदलाव को सही नहीं ठहराया जा सकता।`;
        }
      }
    }

    // Default English Responses
    if (isDebaterA) {
      if (isOpening) {
        return `I stand firmly in favor of the proposition regarding "${topic}". 
The empirical trajectory and fundamental principles at play here demonstrate three decisive realities:

1. **Exponential Capability Scaling**: When we examine systemic historical shifts, technological and paradigm advancements do not merely augment existing structures—they redefine foundational baselines.
2. **Efficiency and Pragmatic Utility**: The core mechanisms driving this shift eliminate friction, reduce operational overhead, and democratize access at a scale previously thought impossible.
3. **Strategic Inevitability**: Resisting this evolution overlooks the competitive dynamics that naturally propel progress forward.

To conclude my opening thesis, accepting this position is not just an optimistic outlook, but a logical necessity dictated by current evidence and future momentum.`;
      } else if (isClosing) {
        return `In my closing statement on "${topic}", let us distill what this entire debate has revealed:

My opponent has attempted to highlight transitional friction and theoretical edge cases. However, they have failed to provide a viable alternative to the undeniable momentum we have proven across each round.

Key pillars we have solidified:
• First-principles logic consistently favors structural transformation over rigid status quo preservation.
• The economic and empirical evidence underscores that adaptation and adoption yield superior collective outcomes.

For these reasons, I urge the judge to recognize the overwhelming weight of reason and declare the affirmative case victorious.`;
      } else {
        return `My opponent raises an intriguing point, but their argument suffers from a fundamental premise flaw. 

They assume that existing constraints will remain static, ignoring the rapid convergence of tooling, adaptation, and systemic resilience. Specifically:

• **False Dilemma**: You suggest a binary trade-off between stability and progress. In reality, modern paradigms integrate robust safeguards precisely while accelerating delivery.
• **Overlooking Empirical Data**: If you examine recent benchmarks, the variance they warn against has dropped precipitously over successive iterations.

We cannot base our long-term perspective on historical limitations that have already been dismantled. The affirmative stance remains the only intellectually coherent position.`;
      }
    } else {
      // Debater B (AGAINST - English)
      if (isOpening) {
        return `I firmly contest the affirmative proposition regarding "${topic}". 
While my esteemed opponent paints a visionary picture, a rigorous and grounded analysis reveals fatal flaws in that narrative:

1. **The Fallacy of Determinism**: Extrapolating linear progress onto complex human and socio-technical systems routinely collapses when confronted with edge cases, nuance, and unpredictable variables.
2. **Critical Vulnerabilities & Unforeseen Costs**: Hasty adoption without essential verification structures introduces systemic fragility, governance failures, and hidden technical debt.
3. **Irreplaceable Contextual Synthesis**: High-level problem solving requires deep domain intuition, ethical judgment, and contextual synthesis that surface-level automation simply cannot replicate.

Therefore, the only prudent and defensible stance is to reject the proposition in its current absolute framing.`;
      } else if (isClosing) {
        return `In closing, this debate has crystallized the critical divide between aspirational hype and grounded reality concerning "${topic}".

Throughout our exchanges, Agent A has relied on broad generalizations while sidestepping the severe structural edge cases, accountability vacuums, and domain subtleties I have raised.

To summarize the definitive opposition case:
• Real-world systems demand rigorous verification and contextual wisdom that cannot be outsourced to blind momentum.
• A balanced, critical perspective safeguards against catastrophic overconfidence and preserves true systemic integrity.

The evidence conclusively demonstrates that the negative position is the only nuanced, robust, and sustainable path. I respectfully ask the judge for a verdict in favor of the opposition.`;
      } else {
        return `Agent A's rebuttal eloquently sidesteps the core vulnerability of their position.

They claim that modern safeguards resolve these systemic issues, yet they provide zero mechanism for handling high-consequence edge failures. Consider:

• **The Verification Bottleneck**: When complexity increases, the cost of verifying correctness scales faster than the speed of initial generation. Who bears liability when subtle failures propagate?
• **Contextual Blind Spots**: Abstract statistical modeling inevitably misses localized domain nuances and qualitative value judgments.

Before embracing an uncritical leap forward, we must demand verifiable reliability over optimistic conjecture. The affirmative argument remains unproven.`;
      }
    }
  }

  private generateMockJudgeResponse(messages: ChatMessage[]): string {
    const transcript = messages.find((m) => m.role === 'user')?.content || '';
    const systemPrompt = messages.find((m) => m.role === 'system')?.content || '';
    const isHindi = systemPrompt.toLowerCase().includes('hindi') || transcript.includes('हिन्दी') || systemPrompt.includes('हिन्दी');

    const length = transcript.length;
    const winner = length % 2 === 0 ? 'Agent A' : 'Agent B';
    const scoreA = winner === 'Agent A' ? 88 : 79;
    const scoreB = winner === 'Agent B' ? 87 : 78;

    if (isHindi) {
      const mockScorecardHindi = {
        winner: winner,
        agentAScore: scoreA,
        agentBScore: scoreB,
        scores: {
          agentA: {
            logic: winner === 'Agent A' ? 9 : 8,
            evidence: 8,
            rebuttal: winner === 'Agent A' ? 9 : 7,
            clarity: 9,
            persuasiveness: winner === 'Agent A' ? 9 : 8,
            accuracy: 9,
          },
          agentB: {
            logic: winner === 'Agent B' ? 9 : 8,
            evidence: winner === 'Agent B' ? 9 : 8,
            rebuttal: 8,
            clarity: 8,
            persuasiveness: winner === 'Agent B' ? 9 : 7,
            accuracy: 8,
          },
        },
        reasoning: `दोनों प्रतिभागियों ने प्रभावशाली और तार्किक बहस प्रस्तुत की। ${winner} ने तर्कों के त्वरित खंडन, सटीक उदाहरणों और पूरे वाद-विवाद के दौरान निरंतर तार्किक दबाव बनाए रखने के कारण निर्णायक बढ़त हासिल की।`,
        agentAStrengths: [
          'सकारात्मक दृष्टिकोण की स्पष्ट संरचना और प्रभावशाली अभिव्यक्ति',
          'तकनीकी प्रगति और उत्पादकता पर सुदृढ़ तर्क',
          'विपक्ष के आक्षेपों का त्वरित उत्तर',
        ],
        agentBStrengths: [
          'व्यवस्थागत जोखिमों और जवाबदेही पर गंभीर प्रश्न',
          'व्यावहारिक सीमाओं और सत्यापन संकट का सटीक विश्लेषण',
          'अति-आशावाद के विरुद्ध संतुलित दृष्टिकोण',
        ],
        agentAWeaknesses: [
          'जवाबदेही और व्यावहारिक सीमाओं पर विस्तृत समाधान की कमी',
          'सामान्यीकृत गतिशीलता पर अत्यधिक निर्भरता',
        ],
        agentBWeaknesses: [
          'सकारात्मक विकल्पों के निर्माण की जगह केवल रक्षात्मक रुख',
          'अनुकूलन की गति का थोड़ा कम आंकलन',
        ],
        keyTurningPoints: [
          'दौर 1: एजेंट A ने प्रगति का मजबूत ढांचा रखा; एजेंट B ने जवाबदेही का सवाल खड़ा किया।',
          'दौर 2: मुख्य खंडनों के दौरान तार्किक स्पष्टता ने परिणाम तय किया।',
        ],
        finalVerdict: `${winner} ने बेहतर तार्किक सुसंगतता और प्रभावी खंडन का प्रदर्शन करते हुए इस वाद-विवाद प्रतियोगिता में विजय प्राप्त की।`,
      };
      return JSON.stringify(mockScorecardHindi, null, 2);
    }

    const mockScorecard = {
      winner: winner,
      agentAScore: scoreA,
      agentBScore: scoreB,
      scores: {
        agentA: {
          logic: winner === 'Agent A' ? 9 : 8,
          evidence: 8,
          rebuttal: winner === 'Agent A' ? 9 : 7,
          clarity: 9,
          persuasiveness: winner === 'Agent A' ? 9 : 8,
          accuracy: 9,
        },
        agentB: {
          logic: winner === 'Agent B' ? 9 : 8,
          evidence: winner === 'Agent B' ? 9 : 8,
          rebuttal: 8,
          clarity: 8,
          persuasiveness: winner === 'Agent B' ? 9 : 7,
          accuracy: 8,
        },
      },
      reasoning: `Both debaters mounted articulate and compelling arguments. ${winner} ultimately gained the decisive advantage through superior rhetorical agility, more effectively dismantling the core premises of the opposing side, and maintaining consistent logical pressure across all rounds.`,
      agentAStrengths: [
        'Structured argument hierarchy with clear analytical categorization',
        'Strong forward momentum and persuasive framing',
        'Effective rhetorical counter-framing against skepticism',
      ],
      agentBStrengths: [
        'Sharp identification of edge-case vulnerabilities and verification bottlenecks',
        'Grounded, pragmatic focus on accountability and systemic risk',
        'Well-timed challenges to deterministic assumptions',
      ],
      agentAWeaknesses: [
        'Occasionally brushed past concrete operational liabilities without deep mitigation details',
        'Relied heavily on macro-level momentum arguments',
      ],
      agentBWeaknesses: [
        'Could have offered more proactive counter-models rather than primarily defensive critiques',
        'Slightly underestimated rapid technological adaptation rates',
      ],
      keyTurningPoints: [
        'Round 1: Agent A set a high bar with exponential scaling thesis; Agent B effectively countered with the verification bottleneck.',
        'Round 2: Agent A reclaimed initiative by exposing the false dilemma fallacy in Agent B’s risk model.',
        'Final Round: Closing synthesis from ' + winner + ' left a lasting impression on overall debate coherence.',
      ],
      finalVerdict: `${winner} demonstrated superior structural cohesion and effectively dismantled the primary vulnerabilities in the opposition's stance, earning the victory in this debate arena contest.`,
    };

    return JSON.stringify(mockScorecard, null, 2);
  }
}

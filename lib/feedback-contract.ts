export const questions = {
 initialExperience: 'Como está sua experiência inicial com a MM Softwares? Quais pontos positivos você destacaria até este momento?',
 trainingExpectations: 'Os treinamentos estão atendendo às suas expectativas? Sua equipe está conseguindo acompanhar os conteúdos apresentados?',
 difficulties: 'Existe alguma dificuldade para acessar ou utilizar as ferramentas, ou alguma dúvida ou preocupação em que possamos ajudar?',
 improvements: 'O que poderíamos fazer para tornar sua experiência ainda melhor?',
 experienceWord: 'Em uma palavra, como você definiria sua experiência até este momento?',
 teamMessage: 'Gostaria de deixar alguma mensagem para a equipe MM Softwares?',
 productExperience: 'Como tem sido sua experiência com o SIWEB e/ou WMS até o momento?',
 rating: 'De 1 a 5, qual nota você atribui à sua experiência geral com o SIWEB e/ou WMS?',
} as const;
export type Followup = { id: string; company: string; title: string; responsible: string; status: string; responses: number };
export type Feedback = { id: string; name: string; feedbackType: string; createdAt: number; answers: Record<string, string> };

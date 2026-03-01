export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  soldOut: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "dogos", name: "Dogos", icon: "🌭" },
  { id: "botanas", name: "Botanas", icon: "🍟" },
  { id: "bebidas", name: "Bebidas", icon: "🥤" },
  { id: "chiles", name: "Chiles", icon: "🌶️" },
  { id: "extras", name: "Extras", icon: "➕" },
];

const p = (id: string, name: string, price: number, category: string): Product => ({
  id, name, price, category, active: true, soldOut: false,
});

export const products: Product[] = [
  // DOGOS
  p("d1", "Dogo Clasico", 59, "dogos"),
  p("d2", "Dogo Clasico con Papas", 53, "dogos"),
  p("d3", "Dogo Arropado", 66, "dogos"),
  p("d4", "Dogo Arropado con Papas", 99, "dogos"),
  p("d5", "Dogo Cielo Mar y Tierra", 42, "dogos"),
  p("d6", "Dogo Combinado", 72, "dogos"),
  p("d7", "Dogo C/P Sazonadas", 89, "dogos"),
  p("d8", "Chiledogo Normal", 72, "dogos"),
  p("d9", "Chiledogo con Papas", 87, "dogos"),
  p("d10", "Chiledogo Jumbo", 87, "dogos"),
  p("d11", "Chiledogo Arropado", 88, "dogos"),
  p("d12", "Chiledogo con Camaron", 79, "dogos"),
  p("d13", "Chiledogo con Carne Asada", 99, "dogos"),
  p("d14", "Chilecheese", 85, "dogos"),
  p("d15", "Chilecheese con Papas", 98, "dogos"),
  p("d16", "Chilecheese Jumbo", 99, "dogos"),
  p("d17", "Chilecheese C/Sazonada", 103, "dogos"),
  p("d18", "Chilecheese Jumbo con Papas", 107, "dogos"),
  p("d19", "Chilecheese Jumb C/Sazonada", 117, "dogos"),
  p("d20", "Chilecheese de Carne", 105, "dogos"),
  p("d21", "Chilecheese Carne C/Papas", 110, "dogos"),
  p("d22", "Chilecheese Carne C/Sazonada", 123, "dogos"),
  p("d23", "Chilecheese de Camaron", 91, "dogos"),
  p("d24", "Chilecheese Camaron C/Papas", 103, "dogos"),
  p("d25", "Chiledog Normal C/Sazonada", 90, "dogos"),
  p("d26", "Chiledog Arropado", 88, "dogos"),
  p("d27", "Chiledog Arrop C/Papas", 103, "dogos"),
  p("d28", "Chiledog Jumb Arro", 99, "dogos"),
  p("d29", "Chiledog Jumbo C/Papas", 99, "dogos"),
  p("d30", "Chiledog Jum Arro C/Sazonada", 106, "dogos"),
  p("d31", "Chiledog Carne C/Papas", 110, "dogos"),
  p("d32", "Chiledog Carne C/Sazonada", 115, "dogos"),
  p("d33", "Chiledog C/Camaron y Papas", 91, "dogos"),
  p("d34", "Chilidg Jumb Arp C/Pap", 113, "dogos"),
  p("d35", "Chilego Jumb C/Sazonada", 104, "dogos"),
  p("d36", "Chori-Dogo Normal", 107, "dogos"),
  p("d37", "Chori-Dogo Jumbo", 59, "dogos"),
  p("d38", "Chori-Dog Normal C/Papas", 69, "dogos"),
  p("d39", "Chori-Dog Jumbo C/Papas", 82, "dogos"),
  p("d40", "Chori-Dog Jumb Arrop", 93, "dogos"),
  p("d41", "Chori-Dog C/Sazonada", 89, "dogos"),
  p("d42", "Chorichese Normal", 65, "dogos"),
  p("d43", "Chorichese Jumbo", 82, "dogos"),
  p("d44", "Chorichese C/P", 77, "dogos"),
  p("d45", "Chorichese Jum C/P", 87, "dogos"),
  p("d46", "Choricheese Arropado", 65, "dogos"),
  p("d47", "Choricheese Arropado C/Papas", 78, "dogos"),
  p("d48", "Choricheese Arropado C/Sazonada", 81, "dogos"),
  p("d49", "Choridog Normal Arropado", 74, "dogos"),
  p("d50", "Choridog Nor Arro C/P", 69, "dogos"),
  p("d51", "Choridog Jumb C/Sazonada", 89, "dogos"),
  p("d52", "Choridogo Arro C/Saz", 75, "dogos"),
  p("d53", "Chorijum Arop C/Saz", 115, "dogos"),
  p("d54", "Quesidogo", 55, "dogos"),
  p("d55", "Quesidogo Clasico", 57, "dogos"),
  p("d56", "Quesidogo Clasico con Papas", 72, "dogos"),
  p("d57", "Quesidogo con Papas", 72, "dogos"),
  p("d58", "Quesidogo con Philadelphia", 58, "dogos"),
  p("d59", "Quesidogo Integral", 42, "dogos"),
  p("d60", "Quesidogo Integral con Papas", 50, "dogos"),
  p("d61", "Quesidogo Cielo Mar y Tierra", 91, "dogos"),
  p("d62", "Quesigo Doble Wini", 70, "dogos"),
  p("d63", "Quesidog C/Sazonada", 72, "dogos"),
  p("d64", "Quesidog Combinado", 67, "dogos"),
  p("d65", "Quesidog Combinado C/Sazonada", 81, "dogos"),
  p("d66", "Quesidog Combindo C/P", 75, "dogos"),
  p("d67", "Quesijumbo", 75, "dogos"),
  p("d68", "Quesijumbo con Papas", 89, "dogos"),
  p("d69", "Quesijumbo C/Sazonada", 93, "dogos"),
  p("d70", "Quesijumbo Philadelfia", 75, "dogos"),
  p("d71", "Quesijumb Philade C/Papas", 90, "dogos"),
  p("d72", "Quesi Phila C/P", 67, "dogos"),
  p("d73", "Quesiphila C/Sazonada", 78, "dogos"),
  p("d74", "Quesi Dble Wini C/Papas", 85, "dogos"),
  p("d75", "Quesi Jumb Phila. Sazonada", 84, "dogos"),
  p("d76", "Quesichoridogo", 69, "dogos"),
  p("d77", "Argentino C/P", 77, "dogos"),
  p("d78", "Dog Cielo Mar y Tierra Arropado", 104, "dogos"),
  p("d79", "Dog Cilomar y Tra C/Papas", 64, "dogos"),
  p("d80", "Combo Rigo", 94, "dogos"),

  // BOTANAS
  p("b1", "Botana Normal", 89, "botanas"),
  p("b2", "Botana Norm C/P", 110, "botanas"),
  p("b3", "Botana Jumbo", 99, "botanas"),
  p("b4", "Botana Jumbo con Papas", 120, "botanas"),
  p("b5", "Botana Italiana", 78, "botanas"),
  p("b6", "Botana Italiana con Papas", 92, "botanas"),
  p("b7", "Botana Cielo Mar y Tierra", 120, "botanas"),
  p("b8", "Chilebotana Normal", 99, "botanas"),
  p("b9", "Chilebotana Jumbo", 119, "botanas"),
  p("b10", "Chilebotana con Camaron", 120, "botanas"),
  p("b11", "Chilebot Normal C/P", 123, "botanas"),
  p("b12", "Chilebot N C/Carne Asada", 125, "botanas"),
  p("b13", "Choribotana C/Papas", 85, "botanas"),
  p("b14", "Media Botana Normal", 64, "botanas"),
  p("b15", "Media Botana Jumbo", 64, "botanas"),
  p("b16", "Media Botana C/Papas", 83, "botanas"),
  p("b17", "Media Botana Cielo Mar y Tierra", 77, "botanas"),
  p("b18", "Media Botna Jum C/Papas", 108, "botanas"),
  p("b19", "Media Chilebotana", 71, "botanas"),
  p("b20", "Media Chilebotana Jumbo", 83, "botanas"),
  p("b21", "Media Chilebotana con Papas", 93, "botanas"),
  p("b22", "Media Chilebotana de Carne", 83, "botanas"),
  p("b23", "Media Chilebotana Camaron", 83, "botanas"),

  // BEBIDAS
  p("be1", "Agua Natural", 12, "bebidas"),
  p("be2", "Agua Ciel", 16, "bebidas"),
  p("be3", "Aguas", 23, "bebidas"),
  p("be4", "Medio Litro de Agua", 20, "bebidas"),
  p("be5", "Litro de Agua", 40, "bebidas"),
  p("be6", "Jugo Chico", 14, "bebidas"),
  p("be7", "Jugo Grande", 18, "bebidas"),
  p("be8", "Refresco de 400", 24, "bebidas"),
  p("be9", "Refresco 450ml", 26, "bebidas"),
  p("be10", "Refresco 600", 29, "bebidas"),
  p("be11", "Refresco de Lata", 29, "bebidas"),
  p("be12", "Refresco de Vidrio", 24, "bebidas"),
  p("be13", "Refresco Te Nice", 19, "bebidas"),
  p("be14", "Refresco Tonicol", 19, "bebidas"),
  p("be15", "Media Salchipapas", 58, "bebidas"),

  // CHILES
  p("ch1", "Chilewini Normal", 45, "chiles"),
  p("ch2", "Chilewini Jumbo", 52, "chiles"),
  p("ch3", "Chiliwini C/Papas", 60, "chiles"),
  p("ch4", "Chiliwini C/Sazonada", 62, "chiles"),
  p("ch5", "Chiliwini Camaron C/Papas", 60, "chiles"),
  p("ch6", "Chiliwini Camaron C/Sazonada", 60, "chiles"),
  p("ch7", "Chilewini con Camaron", 55, "chiles"),
  p("ch8", "Chilewini con Carne Asada", 55, "chiles"),
  p("ch9", "Chiliwin Jumbo C/Papas", 63, "chiles"),
  p("ch10", "Chilecheese C/Sazonada", 91, "chiles"),

  // EXTRAS
  p("e1", "Aguacate", 17, "extras"),
  p("e2", "Arropado", 19, "extras"),
  p("e3", "Champiñón", 16, "extras"),
  p("e4", "Chile Verde", 16, "extras"),
  p("e5", "Carne Hamburguesa", 40, "extras"),
  p("e6", "Bnles Extras P/Dog", 60, "extras"),
];

export const tables = [
  { id: 1, name: "Mesa 1" },
  { id: 2, name: "Mesa 2" },
  { id: 3, name: "Mesa 3" },
  { id: 4, name: "Mesa 4" },
  { id: 5, name: "Mesa 5" },
];

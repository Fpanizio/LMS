import { DatabaseSync } from 'node:sqlite';

interface Course {
  slug: string;
  title: string;
  description: string;
  hours: number;
  lessons: Lesson[];
}

interface Lesson {
  slug: string;
  title: string;
  description: string;
  seconds: number;
  video: string;
  free: number;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const COURSES: Course[] = [
  {
    slug: 'html-e-css',
    title: 'HTML e CSS',
    description: 'Aprenda a criar websites do zero com HTML e CSS',
    hours: 20,
    lessons: [
      {
        slug: 'introducao',
        title: 'Introdução ao HTML',
        description: 'O que é HTML e como funciona',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 1,
      },
      {
        slug: 'estrutura-basica',
        title: 'Estrutura Básica',
        description: 'Estrutura básica de um documento HTML',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 1,
      },
      {
        slug: 'tags-semanticas',
        title: 'Tags Semânticas',
        description: 'Header, main, footer, section, article',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'listas-tabelas',
        title: 'Listas e Tabelas',
        description: 'Criando listas e tabelas em HTML',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'formularios',
        title: 'Formulários',
        description: 'Criando formulários interativos',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'introducao-css',
        title: 'Introdução ao CSS',
        description: 'O que é CSS e como usar',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'seletores',
        title: 'Seletores CSS',
        description: 'Seletores de classe, id, elemento',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'box-model',
        title: 'Box Model',
        description: 'Margin, padding, border, width, height',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'flexbox',
        title: 'Flexbox',
        description: 'Layout flexível com Flexbox',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'grid',
        title: 'CSS Grid',
        description: 'Layout em grade com CSS Grid',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'responsivo',
        title: 'Design Responsivo',
        description: 'Media queries e mobile first',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'animacoes',
        title: 'Animações CSS',
        description: 'Transitions e animations',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'projeto-final',
        title: 'Projeto Final',
        description: 'Criando um site completo',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
    ],
  },
  {
    slug: 'javascript-completo',
    title: 'JavaScript Completo',
    description: 'Domine JavaScript do básico ao avançado',
    hours: 40,
    lessons: [
      {
        slug: 'introducao',
        title: 'Introdução ao JavaScript',
        description: 'O que é JavaScript e onde usar',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 1,
      },
      {
        slug: 'variaveis',
        title: 'Variáveis',
        description: 'var, let, const e escopo',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 1,
      },
      {
        slug: 'tipos-dados',
        title: 'Tipos de Dados',
        description: 'String, Number, Boolean, Array, Object',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'operadores',
        title: 'Operadores',
        description: 'Aritméticos, lógicos, comparação',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'condicionais',
        title: 'Condicionais',
        description: 'if, else, switch, ternário',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'loops',
        title: 'Loops',
        description: 'for, while, forEach, map',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'funcoes',
        title: 'Funções',
        description: 'Declaração, expressão, arrow functions',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'arrays',
        title: 'Arrays',
        description: 'Métodos de array: map, filter, reduce',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'objetos',
        title: 'Objetos',
        description: 'Criação e manipulação de objetos',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'dom',
        title: 'DOM',
        description: 'Manipulação do Document Object Model',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'eventos',
        title: 'Eventos',
        description: 'Click, submit, keypress, scroll',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'async',
        title: 'Assíncrono',
        description: 'Callbacks, Promises, async/await',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'fetch-api',
        title: 'Fetch API',
        description: 'Requisições HTTP com fetch',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'es6-plus',
        title: 'ES6+',
        description: 'Destructuring, spread, rest, modules',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'classes',
        title: 'Classes',
        description: 'POO com JavaScript',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'projeto-final',
        title: 'Projeto Final',
        description: 'Aplicação completa em JavaScript',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
    ],
  },
  {
    slug: 'typescript',
    title: 'TypeScript',
    description: 'Aprenda TypeScript e escreva código mais seguro',
    hours: 25,
    lessons: [
      {
        slug: 'introducao',
        title: 'Introdução ao TypeScript',
        description: 'O que é TypeScript e por que usar',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 1,
      },
      {
        slug: 'configuracao',
        title: 'Configuração',
        description: 'tsconfig.json e ambiente de desenvolvimento',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 1,
      },
      {
        slug: 'tipos-basicos',
        title: 'Tipos Básicos',
        description: 'string, number, boolean, array',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'interfaces',
        title: 'Interfaces',
        description: 'Definindo contratos com interfaces',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'types',
        title: 'Type Aliases',
        description: 'Criando tipos customizados',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'union-intersection',
        title: 'Union e Intersection',
        description: 'Combinando tipos',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'generics',
        title: 'Generics',
        description: 'Tipos genéricos e reutilizáveis',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'classes-ts',
        title: 'Classes em TypeScript',
        description: 'POO com tipagem',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'enums',
        title: 'Enums',
        description: 'Enumerações em TypeScript',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'utility-types',
        title: 'Utility Types',
        description: 'Partial, Required, Pick, Omit',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'narrowing',
        title: 'Type Narrowing',
        description: 'Refinamento de tipos',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'projeto-final',
        title: 'Projeto Final',
        description: 'Aplicação tipada completa',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
    ],
  },
  {
    slug: 'react',
    title: 'React',
    description: 'Crie interfaces modernas com React',
    hours: 35,
    lessons: [
      {
        slug: 'introducao',
        title: 'Introdução ao React',
        description: 'O que é React e Virtual DOM',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 1,
      },
      {
        slug: 'ambiente',
        title: 'Ambiente de Desenvolvimento',
        description: 'Vite, Create React App',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 1,
      },
      {
        slug: 'jsx',
        title: 'JSX',
        description: 'Sintaxe JSX e expressões',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'componentes',
        title: 'Componentes',
        description: 'Criando e organizando componentes',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'props',
        title: 'Props',
        description: 'Passando dados entre componentes',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'state',
        title: 'State',
        description: 'Gerenciando estado com useState',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'eventos',
        title: 'Eventos',
        description: 'Handlers de eventos em React',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'useeffect',
        title: 'useEffect',
        description: 'Efeitos colaterais e lifecycle',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'formularios',
        title: 'Formulários',
        description: 'Controlled components',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'context',
        title: 'Context API',
        description: 'Compartilhando estado global',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'usereducer',
        title: 'useReducer',
        description: 'Gerenciamento de estado complexo',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'custom-hooks',
        title: 'Custom Hooks',
        description: 'Criando hooks personalizados',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'react-router',
        title: 'React Router',
        description: 'Navegação e rotas',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'fetch-data',
        title: 'Fetch de Dados',
        description: 'Requisições API em React',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'performance',
        title: 'Performance',
        description: 'useMemo, useCallback, memo',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'testes',
        title: 'Testes',
        description: 'Testing Library e Jest',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'projeto-final',
        title: 'Projeto Final',
        description: 'Aplicação React completa',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
    ],
  },
  {
    slug: 'nodejs',
    title: 'Node.js',
    description: 'Backend com JavaScript usando Node.js',
    hours: 30,
    lessons: [
      {
        slug: 'introducao',
        title: 'Introdução ao Node.js',
        description: 'O que é Node.js e event loop',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 1,
      },
      {
        slug: 'npm',
        title: 'NPM',
        description: 'Gerenciador de pacotes',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 1,
      },
      {
        slug: 'modules',
        title: 'Módulos',
        description: 'CommonJS e ES Modules',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'filesystem',
        title: 'File System',
        description: 'Leitura e escrita de arquivos',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'http',
        title: 'HTTP Server',
        description: 'Criando servidor HTTP nativo',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'express',
        title: 'Express',
        description: 'Framework web para Node.js',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'rotas',
        title: 'Rotas',
        description: 'Roteamento com Express',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'middleware',
        title: 'Middlewares',
        description: 'Conceito e criação de middlewares',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'rest-api',
        title: 'REST API',
        description: 'Construindo APIs RESTful',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'validacao',
        title: 'Validação',
        description: 'Validando dados de entrada',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'banco-dados',
        title: 'Banco de Dados',
        description: 'SQLite, PostgreSQL, MongoDB',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'autenticacao',
        title: 'Autenticação',
        description: 'JWT e sessões',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'upload',
        title: 'Upload de Arquivos',
        description: 'Multer e streams',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'deploy',
        title: 'Deploy',
        description: 'Publicando aplicação Node.js',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
      {
        slug: 'projeto-final',
        title: 'Projeto Final',
        description: 'API completa em Node.js',
        seconds: randomBetween(300, 900),
        video: 'files/video.mp4',
        free: 0,
      },
    ],
  },
];

function seedCourses() {
  const db = new DatabaseSync('./lms.sqlite');

  console.log('🌱 Seeding courses and lessons...\n');
  console.log('─'.repeat(80));

  for (const course of COURSES) {
    try {
      // Inserir curso
      db.prepare(
        `
        INSERT OR IGNORE INTO courses (slug, title, description, lessons, hours)
        VALUES (?, ?, ?, ?, ?)
      `
      ).run(
        course.slug,
        course.title,
        course.description,
        course.lessons.length,
        course.hours
      );

      const courseRow = db
        .prepare('SELECT id FROM courses WHERE slug = ?')
        .get(course.slug) as { id: number };

      if (!courseRow) {
        console.log(`⚠️  Course "${course.slug}" already exists, skipping...`);
        continue;
      }

      console.log(`\n📚 ${course.title} (${course.lessons.length} aulas)`);

      // Inserir aulas
      for (let i = 0; i < course.lessons.length; i++) {
        const lesson = course.lessons[i];
        try {
          db.prepare(
            `
            INSERT OR IGNORE INTO lessons (course_id, slug, title, description, seconds, video, "order", free)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `
          ).run(
            courseRow.id,
            lesson.slug,
            lesson.title,
            lesson.description,
            lesson.seconds,
            lesson.video,
            i + 1,
            lesson.free
          );

          const status = lesson.free ? '🆓' : '🔒';
          console.log(
            `   ${status} ${(i + 1).toString().padStart(2, '0')}. ${
              lesson.title
            }`
          );
        } catch {
          console.log(`   ⚠️  Skipped (duplicate): ${lesson.slug}`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Error inserting course "${course.slug}":`, error);
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log('\n✅ Seed completed!');

  const coursesCount = db
    .prepare('SELECT COUNT(*) as total FROM courses')
    .get() as { total: number };
  const lessonsCount = db
    .prepare('SELECT COUNT(*) as total FROM lessons')
    .get() as { total: number };

  console.log(`📊 Total courses: ${coursesCount.total}`);
  console.log(`📊 Total lessons: ${lessonsCount.total}`);

  db.close();
}

seedCourses();

/**
 * Schema definition for portfolio.json
 * Defines which fields are required, which are arrays, and what structure they have
 */

export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'unknown';

export interface FieldSchema {
  type: FieldType;
  isArray?: boolean; // Force this field to always be an array (never a single value)
  itemType?: FieldType; // For arrays: what type are the items?
  itemSchema?: Record<string, FieldSchema>; // For arrays of objects: schema of each item
  schema?: Record<string, FieldSchema>; // For objects: schema of nested fields
}

export const portfolioSchema: Record<string, FieldSchema> = {
  personal: {
    type: 'object',
    schema: {
      name: { type: 'string' },
      title: { type: 'string' },
      subtitle: { type: 'string' },
      location: { type: 'string' },
      tagline: { type: 'string' },
      about: { type: 'string' },
      avatar: { type: 'string' },
      resume: { type: 'string' },
      contacts: {
        type: 'object',
        schema: {
          email: { type: 'string' },
          phone: { type: 'string' },
          links: {
            type: 'array',
            isArray: true,
            itemType: 'object',
            itemSchema: {
              label: { type: 'string' },
              url: { type: 'string' },
              icon: { type: 'string' },
              enabled: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
  stats: {
    type: 'array',
    isArray: true,
    itemType: 'object',
    itemSchema: {
      value: { type: 'number' },
      suffix: { type: 'string' },
      label: { type: 'string' },
    },
  },
  skills: {
    type: 'array',
    isArray: true,
    itemType: 'object',
    itemSchema: {
      category: { type: 'string' },
      items: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
    },
  },
  experience: {
    type: 'array',
    isArray: true,
    itemType: 'object',
    itemSchema: {
      company: { type: 'string' },
      url: { type: 'string' },
      position: { type: 'string' },
      startDate: { type: 'string' },
      endDate: { type: 'string' },
      description: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
      skills: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
      projects_ids: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
      id: { type: 'string' },
    },
  },
    education: {
      type: 'array',
      isArray: true,
      itemType: 'object',
      itemSchema: {
        id: { type: 'string' },
        name: { type: 'string' },
        degree: { type: 'string' },
        field: { type: 'string' },
        startYear: { type: 'number' },
        endYear: { type: 'number' },
        grade: { type: 'string' },
        details: { type: 'string' },
        projects_ids: {
          type: 'array',
          isArray: true,
          itemType: 'string',
        },
        project: { type: 'string' },
      },
    },
  projects: {
    type: 'array',
    isArray: true,
    itemType: 'object',
    itemSchema: {
      id: { type: 'string' },
      featured: { type: 'boolean' },
      published: { type: 'boolean' },
      name: { type: 'string' },
      category: { type: 'string' },
      image: { type: 'string' },
      shortDescription: { type: 'string' },
      description: { type: 'string' },
      platforms: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
      'cover-image': { type: 'string' },
      screenshots: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
      videos: {
        type: 'array',
        isArray: true,
        itemType: 'object',
        itemSchema: {
          text: { type: 'string' },
          type: { type: 'string' },
          url: { type: 'string' },
        },
      },
      genre: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
      skills: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
      filterTags: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
      tags: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
      features: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
      links: {
        type: 'array',
        isArray: true,
        itemType: 'object',
        itemSchema: {
          label: { type: 'string' },
          url: { type: 'string' },
          icon: { type: 'string' },
        },
      },
      tech: {
        type: 'array',
        isArray: true,
        itemType: 'string',
      },
      contributions: {
        type: 'array',
        isArray: true,
        itemType: 'object',
        itemSchema: {
          title: { type: 'string' },
          description: { type: 'string' },
          screenshot: {
            type: 'array',
            isArray: true,
            itemType: 'string',
          },
        },
      },
    },
  },
};

/**
 * Creates a template object from a schema
 */
export function createTemplateFromSchema(schema: FieldSchema): unknown {
  if (schema.isArray) {
    return [];
  }

  switch (schema.type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'object': {
      const obj: Record<string, unknown> = {};
      if (schema.schema) {
        Object.entries(schema.schema).forEach(([key, childSchema]) => {
          obj[key] = createTemplateFromSchema(childSchema);
        });
      }
      return obj;
    }
    case 'array': {
      if (schema.itemType === 'object' && schema.itemSchema) {
        const item: Record<string, unknown> = {};
        Object.entries(schema.itemSchema).forEach(([key, childSchema]) => {
          item[key] = createTemplateFromSchema(childSchema);
        });
        return [item];
      }
      return [];
    }
    default:
      return null;
  }
}

/**
 * Get schema for a nested path
 */
export function getSchemaAtPath(
  rootSchema: Record<string, FieldSchema>,
  path: Array<string | number>
): FieldSchema | null {
  if (path.length === 0) {
    return null;
  }

  let current: FieldSchema | null = rootSchema[path[0]] ?? null;

  for (let i = 1; i < path.length; i++) {
    if (!current) {
      return null;
    }

    const key = path[i];

    if (typeof key === 'number') {
      // Navigating into an array item
      if (current.itemSchema) {
        current = current.itemSchema[path[i + 1]] ?? null;
        i++; // Skip the next key since we've already processed it
      } else {
        return null;
      }
    } else if (current.schema) {
      current = current.schema[key] ?? null;
    } else {
      return null;
    }
  }

  return current;
}

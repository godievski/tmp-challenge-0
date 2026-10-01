import { z } from "zod";

export const openLibraryDocSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  author_name: z.array(z.string()).optional(),
  first_publish_year: z.number().int().optional(),
  edition_count: z.number().int().nonnegative().optional(),
});

export type OpenLibraryDocDTO = z.infer<typeof openLibraryDocSchema>;

export const openLibrarySearchResponseSchema = z.object({
  docs: z.array(z.unknown()),
  numFound: z.number().int().nonnegative().optional(),
  num_found: z.number().int().nonnegative().optional(),
});

export type OpenLibrarySearchResponseDTO = z.infer<typeof openLibrarySearchResponseSchema>;

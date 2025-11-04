// Mock sharp for testing
export default function sharp(input: any) {
  return {
    resize: (width?: number, height?: number, options?: any) => ({
      toBuffer: async () => Buffer.from('mock-thumbnail-data'),
      toFile: async (path: string) => ({ path }),
    }),
    toBuffer: async () => Buffer.from('mock-image-data'),
    toFile: async (path: string) => ({ path }),
  };
}

declare module '@testing-library/react' {
  import { ComponentType } from 'react';
  const render: (ui: React.ReactElement, options?: any) => any;
  const fireEvent: any;
  const screen: any;
  const waitFor: any;
  const waitForElementToBeRemoved: any;
  const act: (callback: () => void) => void;
  
  export { render, fireEvent, screen, waitFor, waitForElementToBeRemoved, act };
}

declare module '@radix-ui/react-icons' {
  import { ComponentType, SVGAttributes } from 'react';
  
  export const CloseIcon: ComponentType<SVGAttributes<SVGElement>>;
  export const Cross2Icon: ComponentType<SVGAttributes<SVGElement>>;
  export const CheckIcon: ComponentType<SVGAttributes<SVGElement>>;
  export const ChevronLeftIcon: ComponentType<SVGAttributes<SVGElement>>;
  export const ChevronRightIcon: ComponentType<SVGAttributes<SVGElement>>;
  export const CopyIcon: ComponentType<SVGAttributes<SVGElement>>;
  export const DiscordIcon: ComponentType<SVGAttributes<SVGElement>>;
  export const GitHubIcon: ComponentType<SVGAttributes<SVGElement>>;
  export const InstagramIcon: ComponentType<SVGAttributes<SVGElement>>;
  export const LinkedInIcon: ComponentType<SVGAttributes<SVGElement>>;
  export const TwitterIcon: ComponentType<SVGAttributes<SVGElement>>;
  export const TwitterXIcon: ComponentType<SVGAttributes<SVGElement>>;
}

declare module '@xenova/transformers' {
  import { AnyTensor, Pipeline } from 'onnxruntime-web';
  
  export interface AutoTokenizer {
    from_pretrained: (model: string) => Promise<any>;
  }
  
  export interface AutoModel {
    from_pretrained: (model: string, config?: any) => Promise<any>;
  }
  
  export interface Pipeline {
    (input: any, options?: any): Promise<any>;
  }
  
  export function pipeline(task: string, model?: string | any, config?: any): Promise<Pipeline>;
  
  export const env: {
    allowLocalModels: boolean;
    localModelsPath: string;
  };
}

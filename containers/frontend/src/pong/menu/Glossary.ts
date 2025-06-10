/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Glossary.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/10 16:33:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/10 17:46:36 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity";

import { TextComponent } from "../components/TextComponent";

import { GAME_COLORS } from "../utils/Types";

export class Glossary extends Entity {
    constructor(id: string, layer: string) {
        super(id, layer);
        
        const glossaryText = this.setGlossaryText();
        const textComponent = new TextComponent(glossaryText);
        this.addComponent(textComponent);
    }

    private justifyText(text: string, lineWidth: number = 300): string {
        const lines = text.split('\n');
        const justifiedLines: string[] = [];

        for (const line of lines) {
            if (line.trim().length === 0) {
                justifiedLines.push('');
                continue;
            }

            const words = line.trim().split(/\s+/);
            
            if (words.length === 1) {
                justifiedLines.push(words[0]);
                continue;
            }

            // Calculate spaces needed for justification
            const totalChars = words.join('').length;
            const approxCharWidth = 6; // Estimate for fontSize 10
            const availableSpace = lineWidth - (totalChars * approxCharWidth);
            const gaps = words.length - 1;
            
            if (gaps > 0) {
                const spacesPerGap = Math.floor(availableSpace / (gaps * approxCharWidth));
                const extraSpaces = ' '.repeat(Math.max(1, spacesPerGap));
                justifiedLines.push(words.join(extraSpaces));
            } else {
                justifiedLines.push(words[0]);
            }
        }

        return justifiedLines.join('\n');
    }

    setGlossaryText() {
        const originalText = "Integer rhoncus nibh vel porttitor rutrum. Ut velit elit, vulputate in ex ac, ultricies pharetra ipsum. Ut sed molestie libero. Maecenas sodales enim quis lectus pharetra elementum. Vivamus fermentum risus magna, et rhoncus ligula commodo at. Curabitur sit amet lorem in libero ultricies maximus. Pellentesque semper tincidunt justo eget porttitor. Sed est justo, consectetur sed lobortis ultrices, malesuada sit amet lorem. Praesent sed ante non nibh tempus suscipit. Nullam ligula elit, elementum eget metus eget, condimentum vulputate nulla. Vivamus varius eros posuere, consectetur nisi non, faucibus libero. Cras facilisis odio sit amet ligula gravida pharetra. Morbi tempus ante nec tortor elementum, vitae viverra dolor pretium. Pellentesque sodales eu dolor at tincidunt. Suspendisse egestas metus at ante elementum, sed dignissim elit malesuada. \nMorbi ullamcorper scelerisque fringilla. Cras mauris diam, viverra nec sapien pretium, suscipit ornare purus. Sed eget ex nisl. Mauris ultrices mi sed odio fermentum, ut dignissim purus viverra. Sed facilisis porta nunc, quis mattis ligula rhoncus nec. Maecenas et elit hendrerit dolor venenatis rutrum nec nec purus. Pellentesque ac arcu ligula. Integer luctus elit metus, quis laoreet eros tincidunt sit amet. In nec massa vehicula, venenatis purus vel, sodales felis. Interdum et malesuada fames ac ante ipsum primis in faucibus. In a odio sapien. Suspendisse rhoncus purus dignissim imperdiet consectetur. Donec purus orci, tristique ac vulputate quis, facilisis vitae sapien. Nam finibus nibh leo, ut luctus metus condimentum at. In eros sapien, tempus sed urna sit amet, fringilla ultricies orci. Maecenas elementum tempor nibh sed dictum.\n\nMorbi pretium sapien eu elit faucibus, eget euismod tellus congue. Donec viverra convallis dignissim. Sed ac odio rutrum, efficitur mauris tincidunt, lacinia nulla. Aenean in aliquam tortor, sit amet fringilla nisi. Cras sodales at leo nec ultricies. Phasellus erat lectus, malesuada vel diam eget, luctus sodales tellus. Fusce luctus mattis convallis. Morbi ut purus iaculis, facilisis enim a, imperdiet elit. Nullam nec ultrices dui, sit amet pulvinar nisl. In vel rutrum arcu, ut venenatis tellus. Nunc egestas augue non purus rutrum luctus. Quisque nibh purus, molestie eget efficitur at, pretium a metus. Suspendisse magna ipsum, ultrices non fringilla tincidunt, luctus vitae metus. Sed sodales ipsum in nisl sagittis rutrum. Suspendisse sed tortor sollicitudin, efficitur mi vel, hendrerit nunc.";
        
        // Apply manual justification
        const justifiedText = this.justifyText(originalText, 300);
        
        // Use your TextComponent's constructor signature
        const glossaryText = {
            tag: 'glossary',
            text: justifiedText,
            x: 1100,
            y: 100,
            style: {
                fill: GAME_COLORS.white,
                fontSize: 10,
                fontWeight: 'bold' as const,
                align: 'left' as const,
                wordWrap: true,
                wordWrapWidth: 600,
                breakWords: true,
                lineHeight: 12,
                fontFamily: '"Roboto Mono", monospace', // Match your default
                letterSpacing: 1,
            },
            // Set anchor to top-left for consistent positioning
            anchor: { x: 0, y: 0 }, // This ensures top-left corner positioning
            rotation: 0,
        };
        
        return glossaryText;
    }
}
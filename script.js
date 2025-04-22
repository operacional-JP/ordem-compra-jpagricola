document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pedidoForm');
    const itensTable = document.getElementById('itensTable').getElementsByTagName('tbody')[0];
    const adicionarItemBtn = document.getElementById('adicionarItem');
    const gerarPDFBtn = document.getElementById('gerarPDF');
    const totalGeralElement = document.getElementById('totalGeral');
    
    // Elementos do fornecedor para salvar no localStorage
    const fornecedorRazaoSocial = document.getElementById('fornecedorRazaoSocial');
    const fornecedorCpfCnpj = document.getElementById('fornecedorCpfCnpj');
    const fornecedorEmail = document.getElementById('fornecedorEmail');
    const fornecedorTelefone = document.getElementById('fornecedorTelefone');
    const fornecedorEndereco = document.getElementById('fornecedorEndereco');
    
    let totalGeral = 0;
    
    // Carregar dados do fornecedor do localStorage
    function carregarDadosFornecedor() {
        const dadosSalvos = localStorage.getItem('dadosFornecedorJPAgricola');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            fornecedorRazaoSocial.value = dados.razaoSocial || '';
            fornecedorCpfCnpj.value = dados.cpfCnpj || '';
            fornecedorEmail.value = dados.email || '';
            fornecedorTelefone.value = dados.telefone || '';
            fornecedorEndereco.value = dados.endereco || '';
        }
    }
    
    // Salvar dados do fornecedor no localStorage
    function salvarDadosFornecedor() {
        const dados = {
            razaoSocial: fornecedorRazaoSocial.value,
            cpfCnpj: fornecedorCpfCnpj.value,
            email: fornecedorEmail.value,
            telefone: fornecedorTelefone.value,
            endereco: fornecedorEndereco.value
        };
        localStorage.setItem('dadosFornecedorJPAgricola', JSON.stringify(dados));
    }
    
    // Adicionar evento para salvar quando os campos mudarem
    [fornecedorRazaoSocial, fornecedorCpfCnpj, fornecedorEmail, fornecedorTelefone, fornecedorEndereco].forEach(input => {
        input.addEventListener('change', salvarDadosFornecedor);
    });
    
    // Carregar dados ao iniciar
    carregarDadosFornecedor();
    
    // Adicionar linha de item
    adicionarItemBtn.addEventListener('click', function() {
        if (itensTable.rows.length >= 15) {
            alert('Máximo de 15 itens atingido.');
            return;
        }
        
        const row = itensTable.insertRow();
        
        // Quantidade
        const cellQuantidade = row.insertCell(0);
        const inputQuantidade = document.createElement('input');
        inputQuantidade.type = 'number';
        inputQuantidade.min = '1';
        inputQuantidade.value = '1';
        inputQuantidade.className = 'quantidade-input';
        cellQuantidade.appendChild(inputQuantidade);
        
        // Descrição
        const cellDescricao = row.insertCell(1);
        const inputDescricao = document.createElement('input');
        inputDescricao.type = 'text';
        inputDescricao.className = 'descricao-input';
        inputDescricao.required = true;
        cellDescricao.appendChild(inputDescricao);
        
        // Valor Unitário
        const cellValorUnitario = row.insertCell(2);
        const inputValorUnitario = document.createElement('input');
        inputValorUnitario.type = 'text';
        inputValorUnitario.className = 'valor-input';
        inputValorUnitario.placeholder = 'R$ 0,00';
        inputValorUnitario.addEventListener('focus', function() {
            if (this.value === '') this.value = 'R$ ';
        });
        cellValorUnitario.appendChild(inputValorUnitario);
        
        // Valor Total
        const cellValorTotal = row.insertCell(3);
        const spanValorTotal = document.createElement('span');
        spanValorTotal.textContent = 'R$ 0,00';
        cellValorTotal.appendChild(spanValorTotal);
        
        // Ações
        const cellAcoes = row.insertCell(4);
        const removerLink = document.createElement('a');
        removerLink.href = '#';
        removerLink.className = 'remover-item';
        removerLink.textContent = 'Remover';
        cellAcoes.appendChild(removerLink);
        
        // Event listeners para cálculos
        inputQuantidade.addEventListener('change', calcularLinha);
        inputValorUnitario.addEventListener('input', formatarMoeda);
        inputValorUnitario.addEventListener('change', calcularLinha);
        
        // Event listener para remover linha
        removerLink.addEventListener('click', function(e) {
            e.preventDefault();
            const valorTotalLinha = parseFloat(spanValorTotal.textContent.replace('R$ ', '').replace(',', '.'));
            if (!isNaN(valorTotalLinha)) {
                totalGeral -= valorTotalLinha;
                atualizarTotalGeral();
            }
            itensTable.deleteRow(row.rowIndex - 1);
        });
    });
    
    // Formatador de moeda
    function formatarMoeda(event) {
        const input = event.target;
        let value = input.value.replace(/\D/g, '');
        value = (value / 100).toFixed(2) + '';
        value = value.replace('.', ',');
        value = value.replace(/(\d)(\d{3})(\d{3}),/g, '$1.$2.$3,');
        value = value.replace(/(\d)(\d{3}),/g, '$1.$2,');
        
        if (value === '0,00') {
            input.value = '';
        } else {
            input.value = 'R$ ' + value;
        }
    }
    
    function calcularLinha(event) {
        const row = event.target.closest('tr');
        const inputQuantidade = row.querySelector('.quantidade-input');
        const inputValorUnitario = row.querySelector('.valor-input');
        const spanValorTotal = row.querySelector('td:nth-child(4) span');
        
        const quantidade = parseInt(inputQuantidade.value) || 0;
        const valorUnitario = parseFloat(inputValorUnitario.value.replace(/\D/g, '')) / 100 || 0;
        
        const valorTotal = quantidade * valorUnitario;
        spanValorTotal.textContent = 'R$ ' + valorTotal.toFixed(2).replace('.', ',');
        
        // Atualizar total geral
        calcularTotalGeral();
    }
    
    function calcularTotalGeral() {
        totalGeral = 0;
        const linhas = itensTable.querySelectorAll('tr');
        
        linhas.forEach(row => {
            const valorTotalText = row.querySelector('td:nth-child(4) span').textContent;
            const valorTotal = parseFloat(valorTotalText.replace('R$ ', '').replace(',', '.')) || 0;
            totalGeral += valorTotal;
        });
        
        atualizarTotalGeral();
    }
    
    function atualizarTotalGeral() {
        totalGeralElement.textContent = 'R$ ' + totalGeral.toFixed(2).replace('.', ',');
    }
    
    // Gerar PDF
    gerarPDFBtn.addEventListener('click', async function() {
        if (!form.checkValidity()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        if (itensTable.rows.length === 0) {
            alert('Adicione pelo menos um item ao pedido.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurações do documento
        doc.setFont('helvetica');
        doc.setFontSize(10);
        
        try {
            // Adicionar logo (usando await para carregar)
            const logoUrl = 'operacional-JP/ordem-compra-jpagricola/logo sem fundo.png';
            const logoData = await getBase64Image(logoUrl);
            doc.addImage(logoData, 'PNG', 15, 10, 30, 30);
        } catch (e) {
            console.warn('Erro ao carregar logo, continuando sem imagem...');
        }
        
        // Restante do cabeçalho
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 139);
        doc.text('ORDEM DE COMPRA', 15, 30); // alinhado à esquerda

        
        
        // Informações da empresa
        doc.setFontSize(14); // maior tamanho para o nome
        doc.setFont('helvetica', 'bold'); // nome em negrito
        doc.text('JP Agrícola LTDA', 150, 15);

        doc.setFontSize(9); // endereço menor
        doc.setFont('helvetica', 'normal'); // sem negrito
        doc.text('Av. Presidente Vargas, Escritório 04', 150, 20);
        doc.text('CEP 68.625-130 Paragominas - PA', 150, 30);
        doc.text('(Anexo ao Posto Vale do Uraim)', 150, 25);

        // Linha divisória
        doc.setDrawColor(0, 0, 139);
        doc.setLineWidth(0.5);
        doc.line(15, 45, 195, 45);
        
        // Dados do Pedido
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 139);
        doc.text('DADOS DO PEDIDO', 15, 50);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        doc.text(`Data da Solicitação: ${formatDate(document.getElementById('dataSolicitacao').value)}`, 15, 60);
        doc.text(`Solicitante: ${document.getElementById('solicitante').value}`, 15, 65);
        doc.text(`Centro de Custo: ${document.getElementById('centroCusto').value}`, 15, 70);

         // Linha divisória
         doc.setDrawColor(0, 0, 139);
         doc.setLineWidth(0.5);
         doc.line(15, 75, 195, 75);
        
        // Dados do Fornecedor
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 139);
        doc.text('DADOS DO FORNECEDOR', 15, 85);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        doc.text(`Razão Social: ${document.getElementById('fornecedorRazaoSocial').value}`, 15, 95);
        doc.text(`CPF/CNPJ: ${formatCpfCnpj(document.getElementById('fornecedorCpfCnpj').value)}`, 15, 100);
        doc.text(`E-mail: ${document.getElementById('fornecedorEmail').value}`, 15, 105);
        doc.text(`Telefone: ${formatTelefone(document.getElementById('fornecedorTelefone').value)}`, 15, 110);
        doc.text(`Endereço: ${document.getElementById('fornecedorEndereco').value}`, 15, 115);

         // Linha divisória
         doc.setDrawColor(0, 0, 139);
         doc.setLineWidth(0.5);
         doc.line(15, 120, 195, 120);
        
        // Dados da Compra
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 139);
        doc.text('DADOS DA COMPRA', 15, 130);
        
        // Preparar dados para a tabela
        const itensData = [];
        const linhas = itensTable.querySelectorAll('tr');
        
        linhas.forEach(row => {
            const quantidade = row.querySelector('.quantidade-input').value;
            const descricao = row.querySelector('.descricao-input').value;
            const valorUnitario = row.querySelector('.valor-input').value || 'R$ 0,00';
            const valorTotal = row.querySelector('td:nth-child(4) span').textContent;
            
            itensData.push([
                quantidade,
                descricao,
                valorUnitario,
                valorTotal
            ]);
        });
        
        // Adicionar tabela
        doc.autoTable({
            startY: 135,
            head: [['Quant.', 'Produto/Serviço', 'Vl. Unitário', 'Vl. Total']],
            body: itensData,
            headStyles: {
                fillColor: [0, 0, 139],
                textColor: 255,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                overflow: 'linebreak',
                halign: 'left'
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 100 },
                2: { cellWidth: 25, halign: 'right' },
                3: { cellWidth: 25, halign: 'right' }
            }
        });
        
        // Total geral
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Geral: ${totalGeralElement.textContent}`, 160, finalY, { align: 'right' });
        
        // Forma de pagamento
        const formaPagamento = document.querySelector('input[name="pagamento"]:checked').value;
        doc.text(`Forma de Pagamento: ${formaPagamento}`, 15, finalY + 10);
        doc.text(`Prazo para Pagamento: ${document.getElementById('prazoPagamento').value}`, 15, finalY + 15);

         // Linha divisória
         doc.setDrawColor(0, 0, 139);
         doc.setLineWidth(0.5);
         doc.line(15, finalY + 20, 195, finalY + 20);
        
        // Notas de rodapé
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('ENVIAR NOTAS FISCAIS E BOLETOS PARA:', 15, finalY + 25);
        doc.text('contato@jpconsultoriaagricola.com.br', 15, finalY + 30);
        doc.text('financeiro@jpconsultoriaagricola.com.br', 15, finalY + 35);
        doc.text('adm@jpconsultoriaagricola.com.br', 15, finalY + 40);
        doc.text('Telefone: 91 99112-9685', 15, finalY + 45);

        
        // Salvar PDF
        doc.save(`OrdemCompra_${document.getElementById('fornecedorRazaoSocial').value}_${formatDate(document.getElementById('dataSolicitacao').value)}.pdf`);
    });
    
    // Funções auxiliares
    function getBase64Image(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = url;
        });
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    function formatCpfCnpj(value) {
        if (!value) return '';
        // Remove tudo que não é dígito
        const cleanValue = value.replace(/\D/g, '');
        
        // Formata CPF (11 dígitos)
        if (cleanValue.length === 11) {
            return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        // Formata CNPJ (14 dígitos)
        else if (cleanValue.length === 14) {
            return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        // Retorna o valor original se não for CPF nem CNPJ
        return value;
    }
    
    function formatTelefone(value) {
        if (!value) return '';
        // Remove tudo que não é dígito
        const cleanValue = value.replace(/\D/g, '');
        
        // Formata telefone (11 dígitos com DDD)
        if (cleanValue.length === 11) {
            return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        // Formata telefone (10 dígitos com DDD)
        else if (cleanValue.length === 10) {
            return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        // Retorna o valor original se não for um telefone válido
        return value;
    }
    
    // Adicionar primeira linha automaticamente
    adicionarItemBtn.click();
});

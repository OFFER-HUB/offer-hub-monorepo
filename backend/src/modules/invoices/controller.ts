import { Controller, Get, Param, Res, NotFoundException, Req, UnauthorizedException, HttpStatus, Headers } from '@nestjs/common';
import { Response, Request } from 'express';
import { InvoiceService } from './service';

@Controller('invoices')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) {}

    /**
     * Extracts the user ID from the authorization token or custom headers
     * Note: This is a simple example. In a real case implement
     * their own token verification system according to the authentication method.
     */
    private getUserIdFromRequest(req: Request, headers: any): string | null {
        // Here you can implement your specific logic to extract and validate the user ID
        // Example using a custom header (just as a demonstration)
        const userId = headers['x-user-id'] || req.headers['x-user-id'];
        
        // You could also extract the user from cookies or the request body
        // depending on how you implement authentication in your application
        
        return userId || null;
    }

    /**
     * Gets the download URL of an invoice
     * @param transactionId Transaction ID
     * @param req Express request object
     * @param headers HTTP headers
     */
    @Get('url/:transactionId')
    async getInvoiceUrl(
        @Param('transactionId') transactionId: string, 
        @Req() req: Request,
        @Headers() headers: any
    ) {
        try {
            // Get the user ID from the request
            const userId = this.getUserIdFromRequest(req, headers);
            
            if (!userId) {
                throw new UnauthorizedException('User not authenticated');
            }
            
            // Get the invoice URL
            const invoiceUrl = await this.invoiceService.getInvoiceUrl(transactionId, userId);
            
            return {
                success: true,
                url: invoiceUrl,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                return {
                    success: false,
                    message: error.message,
                    statusCode: HttpStatus.NOT_FOUND,
                };
            }
            
            if (error instanceof UnauthorizedException) {
                return {
                    success: false,
                    message: error.message,
                    statusCode: HttpStatus.UNAUTHORIZED,
                };
            }
            
            return {
                success: false,
                message: error.message,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }

    /**
     * Generates an invoice for a transaction and returns the URL for its download
     * @param transactionId Transaction ID
     * @param req Express request object
     * @param headers HTTP headers
     */
    @Get('generate/:transactionId')
    async generateInvoice(
        @Param('transactionId') transactionId: string, 
        @Req() req: Request,
        @Headers() headers: any
    ) {
        try {
            // Get the user ID from the request
            const userId = this.getUserIdFromRequest(req, headers);
            
            if (!userId) throw new UnauthorizedException('User not authenticated');
            
            // Generate the invoice and get its URL
            const invoiceUrl = await this.invoiceService.generateInvoiceForTransaction(transactionId);
            
            return {
                success: true,
                message: 'Invoice generated successfully',
                url: invoiceUrl,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    /**
     * Redirects the user to the invoice download URL
     * @param transactionId Transaction ID
     * @param req Express request object
     * @param res Express response object
     * @param headers HTTP headers
     */
    @Get('download/:transactionId')
    async downloadInvoice(
        @Param('transactionId') transactionId: string, 
        @Req() req: Request,
        @Res() res: Response,
        @Headers() headers: any
    ) {
        try {
            // Get the user ID from the request
            const userId = this.getUserIdFromRequest(req, headers);
            
            if (!userId) throw new UnauthorizedException('User not authenticated');
            
            // Get the invoice URL
            const invoiceUrl = await this.invoiceService.getInvoiceUrl(transactionId, userId);
            
            // Redirect the user to the download URL
            return res.redirect(invoiceUrl);
        } catch (error) {
            if (error instanceof NotFoundException) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: error.message,
                });
            }
            
            if (error instanceof UnauthorizedException) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: error.message,
                });
            }
            
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }
}
